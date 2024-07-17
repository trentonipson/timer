document.addEventListener('DOMContentLoaded', () => {
    class Timepiece {
        constructor(name) {
            this.name = name;
            this.intervalId = null;
            this.isRunning = false;
        }

        startPause() {
            if (this.isRunning) {
                this.pause();
            } else {
                this.start();
            }
        }

        start() {
            this.intervalId = setInterval(() => this.update(), 100);
            this.isRunning = true;
        }

        pause() {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.isRunning = false;
        }

        reset() {
            this.pause();
            this.resetTime();
            this.update(true);
        }

        update(reset = false) {
            const display = this.formatTime(reset ? this.resetTime() : this.getCurrentTime());
            document.getElementById(`display-${this.name}`).textContent = display;
        }

        formatTime(time) {
            const milliseconds = Math.floor((time % 1000) / 100);
            const seconds = Math.floor((time / 1000) % 60);
            const minutes = Math.floor((time / (1000 * 60)) % 60);
            const hours = Math.floor((time / (1000 * 60 * 60)) % 24);

            return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}.${milliseconds}`;
        }

        pad(number) {
            return number.toString().padStart(2, '0');
        }
    }

    class Stopwatch extends Timepiece {
        constructor(name) {
            super(name);
            this.startTime = 0;
            this.elapsedTime = 0;
        }

        start() {
            this.startTime = Date.now() - this.elapsedTime;
            super.start();
        }

        pause() {
            this.elapsedTime = Date.now() - this.startTime;
            super.pause();
        }

        resetTime() {
            this.elapsedTime = 0;
            this.startTime = 0;
            return 0;
        }

        getCurrentTime() {
            return Date.now() - this.startTime;
        }
    }

    class Timer extends Timepiece {
        constructor(name, duration) {
            super(name);
            this.startTime = 0;
            this.remainingTime = duration;
        }

        start() {
            this.startTime = Date.now();
            super.start();
        }

        pause() {
            this.remainingTime -= Date.now() - this.startTime;
            super.pause();
        }

        resetTime() {
            this.remainingTime = 0;
            return 0;
        }

        getCurrentTime() {
            return this.remainingTime - (Date.now() - this.startTime);
        }

        update(reset = false) {
            if (!reset && this.getCurrentTime() <= 0) {
                this.reset();
                document.getElementById(`display-${this.name}`).textContent = '00:00:00.0';
                alert('Timer ended!');
                return;
            }
            super.update(reset);
        }
    }

    function addTimepiece(type, name, duration = 0) {
        const timepiece = type === 'Stopwatch' ? new Stopwatch(name) : new Timer(name, duration);

        const timepieceContainer = document.createElement('div');
        timepieceContainer.className = 'timepiece';

        const removeButton = document.createElement('button');
        removeButton.textContent = 'X';
        removeButton.className = 'remove-button';
        removeButton.addEventListener('click', () => {
            document.getElementById('timepieces-container').removeChild(timepieceContainer);
            saveTimepieces();
        });
        timepieceContainer.appendChild(removeButton);

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = `Enter name for ${type}`;
        nameInput.value = name;
        nameInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                timepieceHeader.textContent = nameInput.value || `Unnamed ${type}`;
                nameInput.style.display = 'none';
                editButton.style.display = 'inline';
                saveTimepieces();
            }
        });
        timepieceContainer.appendChild(nameInput);

        const timepieceHeader = document.createElement('h1');
        timepieceHeader.textContent = name || `Unnamed ${type}`;
        timepieceContainer.appendChild(timepieceHeader);

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit Name';
        editButton.style.display = 'none';
        editButton.addEventListener('click', () => {
            nameInput.style.display = 'inline';
            nameInput.focus();
            editButton.style.display = 'none';
        });
        timepieceContainer.appendChild(editButton);

        if (type === 'Timer') {
            const durationInputs = createDurationInputs(timepiece);
            durationInputs.forEach(input => timepieceContainer.appendChild(input));

            const applyButton = document.createElement('button');
            applyButton.textContent = 'Apply';
            applyButton.addEventListener('click', () => {
                const duration = getDurationFromInputs(timepieceContainer);
                timepiece.remainingTime = duration;
                saveTimepieces();
            });
            timepieceContainer.appendChild(applyButton);
        }

        const timepieceDisplay = document.createElement('div');
        timepieceDisplay.id = `display-${name}`;
        timepieceDisplay.textContent = '00:00:00.0';
        timepieceContainer.appendChild(timepieceDisplay);

        const startPauseButton = document.createElement('button');
        startPauseButton.textContent = 'Start';
        startPauseButton.addEventListener('click', () => {
            if (type === 'Timer') {
                const duration = getDurationFromInputs(timepieceContainer);
                timepiece.remainingTime = duration;
            }
            timepiece.startPause();
            startPauseButton.textContent = timepiece.isRunning ? 'Pause' : 'Start';
        });
        timepieceContainer.appendChild(startPauseButton);

        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset';
        resetButton.addEventListener('click', () => {
            timepiece.reset();
            startPauseButton.textContent = 'Start';
        });
        timepieceContainer.appendChild(resetButton);

        document.getElementById('timepieces-container').appendChild(timepieceContainer);

        saveTimepieces();
    }

    function createDurationInputs(timepiece) {
        const hoursInput = document.createElement('input');
        hoursInput.type = 'number';
        hoursInput.className = 'timer-duration';
        hoursInput.placeholder = 'Hours';
        hoursInput.value = 0;

        const minutesInput = document.createElement('input');
        minutesInput.type = 'number';
        minutesInput.className = 'timer-duration';
        minutesInput.placeholder = 'Minutes';
        minutesInput.value = 0;

        const secondsInput = document.createElement('input');
        secondsInput.type = 'number';
        secondsInput.className = 'timer-duration';
        secondsInput.placeholder = 'Seconds';
        secondsInput.value = 0;

        return [hoursInput, minutesInput, secondsInput];
    }

    function getDurationFromInputs(container) {
        const hours = parseInt(container.querySelector('input.timer-duration[placeholder="Hours"]').value, 10) || 0;
        const minutes = parseInt(container.querySelector('input.timer-duration[placeholder="Minutes"]').value, 10) || 0;
        const seconds = parseInt(container.querySelector('input.timer-duration[placeholder="Seconds"]').value, 10) || 0;
        return ((hours * 3600) + (minutes * 60) + seconds) * 1000; // Convert to milliseconds
    }

    function saveTimepieces() {
        const timepieces = [];
        document.querySelectorAll('.timepiece').forEach(timepieceContainer => {
            const type = timepieceContainer.querySelector('h1').textContent.includes('Stopwatch') ? 'Stopwatch' : 'Timer';
            const name = timepieceContainer.querySelector('input[type="text"]').value;
            const duration = type === 'Timer' ? getDurationFromInputs(timepieceContainer) : 0;
            timepieces.push({ type, name, duration });
        });
        localStorage.setItem('timepieces', JSON.stringify(timepieces));
    }

    function loadTimepieces() {
        const timepieces = JSON.parse(localStorage.getItem('timepieces')) || [];
        timepieces.forEach(timepiece => {
            addTimepiece(timepiece.type, timepiece.name, timepiece.duration);
        });
    }

    function authenticateUser(email, password, isNewUser) {
        const users = JSON.parse(localStorage.getItem('users')) || {};
        if (isNewUser) {
            if (users[email]) {
                alert('User already exists!');
                return false;
            }
            users[email] = { password };
            localStorage.setItem('users', JSON.stringify(users));
            alert('User registered successfully!');
        } else {
            if (!users[email] || users[email].password !== password) {
                alert('Invalid email or password!');
                return false;
            }
        }
        localStorage.setItem('currentUser', email);
        return true;
    }

    function showAppContainer() {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        document.getElementById('user-email').textContent = localStorage.getItem('currentUser');
    }

    function hideAppContainer() {
        document.getElementById('auth-container').style.display = 'block';
        document.getElementById('app-container').style.display = 'none';
        document.getElementById('user-email').textContent = '';
    }

    document.getElementById('login').addEventListener('click', () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        if (authenticateUser(email, password, false)) {
            showAppContainer();
            loadTimepieces();
        }
    });

    document.getElementById('register').addEventListener('click', () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        if (authenticateUser(email, password, true)) {
            showAppContainer();
        }
    });

    document.getElementById('logout').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('timepieces');
        hideAppContainer();
    });

    document.getElementById('add-stopwatch').addEventListener('click', () => addTimepiece('Stopwatch'));
    document.getElementById('add-timer').addEventListener('click', () => addTimepiece('Timer'));

    if (localStorage.getItem('currentUser')) {
        showAppContainer();
        loadTimepieces();
    }

    document.getElementById('profile-settings').addEventListener('click', () => {
        document.getElementById('profile-settings-container').style.display = 'block';
    });

    document.getElementById('change-password').addEventListener('click', () => {
        const currentUser = localStorage.getItem('currentUser');
        const newPassword = document.getElementById('new-password').value;
        const users = JSON.parse(localStorage.getItem('users')) || {};
        if (currentUser && users[currentUser]) {
            users[currentUser].password = newPassword;
            localStorage.setItem('users', JSON.stringify(users));
            alert('Password changed successfully!');
            document.getElementById('new-password').value = '';
        } else {
            alert('Error changing password!');
        }
    });

    document.getElementById('delete-account').addEventListener('click', () => {
        const currentUser = localStorage.getItem('currentUser');
        const users = JSON.parse(localStorage.getItem('users')) || {};
        if (currentUser && users[currentUser]) {
            delete users[currentUser];
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.removeItem('currentUser');
            localStorage.removeItem('timepieces');
            alert('Account deleted successfully!');
            hideAppContainer();
        } else {
            alert('Error deleting account!');
        }
    });
});
