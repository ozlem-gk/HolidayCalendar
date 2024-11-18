import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid'; // Aylık takvim görünümü için
import interactionPlugin from '@fullcalendar/interaction'; // Etkileşim özellikleri
import listPlugin from '@fullcalendar/list'; // Yıllık takvim için liste görünümü
import { jsPDF } from 'jspdf'; // jsPDF import
import html2canvas from 'html2canvas'; // html2canvas import
import './CustomCalendar.css';

const Calendar = () => {
  const [holidays, setHolidays] = useState([]);
  const [country, setCountry] = useState('');
  const [stateType, setStateType] = useState('');
  const [holidayType, setHolidayType] = useState('');
  const [year, setYear] = useState(2024);
  const [view, setView] = useState('month'); // Takvim görünümü 'month' ya da 'year'

  // API'den tatilleri almak için useEffect
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await axios.get('https://localhost:7148/api/Holiday', {
          params: {
            country,
            stateType,
            holidayType,
          },
        });
        setHolidays(response.data);
      } catch (error) {
        console.error('Veri çekme hatası:', error);
      }
    };

    fetchHolidays();
  }, [country, stateType, holidayType]);

  
  const events = holidays
    .filter((holiday) => holiday.date) // `date` undefined ise filtrele
    .map((holiday) => {
      const [holidayYear, holidayMonth, holidayDay] = holiday.date.split('T')[0].split('-');
      const dynamicDate = new Date(year, holidayMonth - 1, holidayDay); // Seçilen yılı kullan

      return {
        title: holiday.name || 'Bilinmeyen Tatil', // Tatil ismi
        date: dynamicDate.toISOString().split('T')[0], // YYYY-MM-DD formatında
        color: 'blue', // Tatil rengini belirleme
        textColor: 'white', // Yazı rengi
      };
    });

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const monthsInYear = Array.from({ length: 12 }, (_, i) => i); // 0-11 arasındaki sayılar

  // PDF İndirme fonksiyonu
  const downloadPDF = () => {
    const calendarElement = document.querySelector('.fc'); // Takvimi render eden FullCalendar container'ı

    // html2canvas ile takvimin görüntüsünü al
    html2canvas(calendarElement).then((canvas) => {
      // Canvas'ı PDF'e dönüştür
      const imgData = canvas.toDataURL('image/png'); // Canvas'ı resme çevir
      const doc = new jsPDF('p', 'mm', 'a4');
      
      // Resmi PDF'e ekle
      doc.addImage(imgData, 'PNG', 10, 10, 190, 270); // Resmin konumunu ve boyutunu ayarlayabilirsiniz

      // PDF dosyasını kaydet
      doc.save('calendar.pdf');
    });
  };

  return (
    <div>
      <h2>{view === 'month' ? 'Aylık Takvim' : 'Yıllık Takvim'}</h2>

      {/* Filtreleme Formu */}
      <form>
        <label>
          Ülke:
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </label>

        <label>
          Eyalet:
          <select value={stateType} onChange={(e) => setStateType(e.target.value)}>
            <option value="">Tümü</option>
            <option value="Baden-Württemberg">Baden-Württemberg</option>
            <option value="Bavaria">Bavaria</option>
            <option value="Saxony-Anhalt">Saxony-Anhalt</option>
            <option value="Berlin">Berlin</option>
            <option value="Mecklenburg-Western Pomerania">Mecklenburg-Western Pomerania</option>
            <option value="Brandenburg">Brandenburg</option>
            <option value="Hesse">Hesse</option>
            <option value="North Rhine-Westphalia">North Rhine-Westphalia</option>
            <option value="Rhineland-Palatinate">Rhineland-Palatinate</option>
            <option value="Saarland">Saarland</option>
            <option value="Thuringia">Thuringia</option>
            <option value="Saxony">Saxony</option>
            <option value="Bremen">Bremen</option>
            <option value="Hamburg">Hamburg</option>
            <option value="Lower Saxony">Lower Saxony</option>
            <option value="Schleswig-Holstein">Schleswig-Holstein</option>
          </select>
        </label>

        <label>
          Tatil Türü:
          <select value={holidayType} onChange={(e) => setHolidayType(e.target.value)}>
            <option value="">Tümü</option>
            <option value="religious">Dini Tatil</option>
            <option value="national">Ulusal Tatil</option>
            <option value="school">Okul Tatili</option>
          </select>
        </label>

        <label>
          Yıl:
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </label>

        <button type="button" onClick={() => handleViewChange('month')}>Aylık Görünüm</button>
        <button type="button" onClick={() => handleViewChange('year')}>Yıllık Görünüm</button>
      </form>

      {/* PDF İndirme Butonu */}
      <button type="button" onClick={downloadPDF}>PDF Olarak İndir</button>

      {/* Yıllık Takvim */}
      {view === 'year' && (
        <div className="year-view">
          {/* 4x3 matrix for months */}
          {monthsInYear.map((monthIndex) => (
            <div className="month" key={monthIndex}>
              <h3>{new Date(year, monthIndex).toLocaleString('default', { month: 'long' })}</h3>
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events.filter(event => {
                  // O ayın etkinliklerini filtreliyoruz
                  return new Date(event.date).getMonth() === monthIndex;  // Ay numarasını karşılaştırıyoruz
                })}
                headerToolbar={false} // Default header'ı gizle
                dateClick={(info) => alert('Tıklanan tarih: ' + info.dateStr)} // Tarih tıklama olayı
                dayCellClassNames={(date) => {
                  const today = new Date();
                  // Bugün hangi aydaysak, sadece o ayın gününü işaretleyelim
                  if (today.getMonth() === monthIndex && today.getDate() === date.date.getDate()) {
                    return 'today'; // Bu ayda olan günün stilini değiştirebiliriz
                  }
                  return '';
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Aylık Takvim */}
      {view === 'month' && (
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={(info) => alert('Tıklanan tarih: ' + info.dateStr)}
          editable={true}
          selectable={true}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,listYear',
          }}
        />
      )}
    </div>
  );
};

export default Calendar;
