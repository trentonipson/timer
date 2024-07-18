let is12HourFormat = true; // Initial format

function updateTime() {
  const date = new Date();
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  if (is12HourFormat) {
    hours = hours % 12 || 12; // Convert to 12-hour format (12 for midnight)
  }

  const timeString = `${hours.toString().padStart(2, '0')}:${minutes}:${seconds}`;

  document.getElementById("clock").innerHTML = timeString;
}

const format12hrButton = document.getElementById("format-12hr");
const format24hrButton = document.getElementById("format-24hr");

format12hrButton.addEventListener("click", () => {
  is12HourFormat = true;
  updateTime();
});

format24hrButton.addEventListener("click", () => {
  is12HourFormat = false;
  updateTime();
});

setInterval(updateTime, 1000);

