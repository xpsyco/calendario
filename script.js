document.addEventListener('DOMContentLoaded', () => {
    const calendarBody = document.getElementById('calendar-body');
    const currentMonthYearEl = document.getElementById('current-month-year');
    const selectedDayInfoEl = document.getElementById('selected-day-info');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const installButtonContainer = document.getElementById('install-button-container');
    const installButton = document.getElementById('install-button');

    let deferredPrompt;

    let date = new Date();
    let currentMonth = date.getMonth();
    let currentYear = date.getFullYear();
    const todayDay = date.getDate();
    const todayMonth = date.getMonth();
    const todayYear = date.getFullYear();

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const dayNames = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

    function renderCalendar() {
        calendarBody.innerHTML = '';
        currentMonthYearEl.textContent = `${monthNames[currentMonth]} ${currentYear}`;

        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();


        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('day-cell', 'empty');
            calendarBody.appendChild(emptyCell);
        }


        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('day-cell');
            dayCell.innerHTML = `<span class="day-number">${day}</span>`;
            dayCell.dataset.day = day;

            const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
            const emojis = [];


            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                emojis.push('🏫');
                if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
                    emojis.push('🥋');
                }
            } else if (dayOfWeek === 0 || dayOfWeek === 6) {
                emojis.push('🧸');
            }


            if (emojis.length > 0) {
                const emojiContainer = document.createElement('div');
                emojiContainer.classList.add('day-emojis');
                emojiContainer.innerHTML = emojis.map(emoji => `<span>${emoji}</span>`).join('');
                dayCell.appendChild(emojiContainer);
            }


            if (day === todayDay && currentMonth === todayMonth && currentYear === todayYear) {
                dayCell.classList.add('today');
                dayCell.style.position = 'relative';
                const girlEmoji = document.createElement('span');
                girlEmoji.classList.add('girl-emoji');
                girlEmoji.textContent = '👧🏻';
                dayCell.appendChild(girlEmoji);
                updateSelectedDayInfo(day, dayOfWeek, emojis.map(emoji => `<span>${emoji}</span>`).join(''));
            }


            dayCell.addEventListener('click', () => {

                document.querySelectorAll('.day-cell').forEach(cell => cell.classList.remove('selected-day'));


                dayCell.classList.add('selected-day');
                dayCell.classList.add('pop');


                dayCell.addEventListener('animationend', () => {
                    dayCell.classList.remove('pop');
                }, { once: true });


                const clickedEmojisHtml = dayCell.querySelector('.day-emojis') ? dayCell.querySelector('.day-emojis').innerHTML : '';
                updateSelectedDayInfo(day, dayOfWeek, clickedEmojisHtml);
            });

            calendarBody.appendChild(dayCell);
        }
    }


    function updateSelectedDayInfo(day, dayOfWeek, emojisHtml) {
        selectedDayInfoEl.innerHTML = `
            <span class="day-text">${dayNames[dayOfWeek]}, ${day} de ${monthNames[currentMonth]}</span>
            <div class="day-emojis-selected">${emojisHtml}</div>
        `;
    }


    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    renderCalendar();
    installButton.disabled = true;
    installButton.textContent = 'Verificando instalação...';


    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installButton.disabled = false;
        installButton.textContent = 'Instalar App 🚀';
        console.log('Evento beforeinstallprompt disparado. Botão de instalação habilitado.');
    });


    installButton.addEventListener('click', async () => {
        if (deferredPrompt) {

            installButton.disabled = true;
            installButton.textContent = 'Instalando...';


            deferredPrompt.prompt();


            const { outcome } = await deferredPrompt.userChoice;
            console.log(`Escolha do usuário sobre a instalação: ${outcome}`);


            deferredPrompt = null;
            if (outcome === 'accepted') {
                console.log('Usuário aceitou a instalação do PWA.');
                installButton.textContent = 'App Instalado! 🎉';
            } else {
                console.log('Usuário recusou a instalação do PWA.');
                installButton.textContent = 'Instalar App 🚀';
                installButton.disabled = true;
            }
        }
    });


    window.addEventListener('appinstalled', () => {
        console.log('PWA Calendário Divertido foi instalado com sucesso!');
        installButton.textContent = 'App Instalado! 🎉';
        installButton.disabled = true;
    });


    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('service-worker.js')
                .then(reg => {
                    console.log('Service Worker registrado com sucesso:', reg);
                })
                .catch(err => {
                    console.log('Falha ao registrar o Service Worker:', err);
                });
        });
    }


    window.triggerInstallPrompt = () => {
        if (deferredPrompt) {
            console.warn('Prompt de instalação já disponível. Não é necessário forçar.');
            installButtonContainer.classList.remove('hidden');
            return;
        }
        console.log('Tentando simular o evento beforeinstallprompt...');
        const mockEvent = new Event('beforeinstallprompt');

        mockEvent.preventDefault = () => { console.log('preventDefault() chamado no mock event.'); };
        mockEvent.prompt = async () => {
            console.log('prompt() chamado no mock event.');
            mockEvent.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' });
            return mockEvent.userChoice;
        };
        deferredPrompt = mockEvent;
        installButtonContainer.classList.remove('hidden');
        console.log('Botão de instalação forçado a aparecer para depuração.');
    };
});
