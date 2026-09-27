/*
  ==========================================
  BRYLLUPSSIDE – JAVASCRIPT
  ==========================================

  Denne filen styrer:

  1. Nedtelling til bryllupet
  2. Mobilmeny
  3. Animasjoner når man scroller
  4. RSVP-skjemaets visning og validering

  Foreløpig lagres IKKE RSVP-svarene noe sted.
  Senere kan vi koble dette til PHP og MySQL.
*/


/*
  ------------------------------------------
  1. NEDTELLING TIL BRYLLUPET
  ------------------------------------------

  Bytt denne datoen til faktisk bryllupsdato.

  Format:
  ÅR-MÅNED-DAG TID

  Eksempel:
  "2027-06-12T14:00:00"
*/
const weddingDate = new Date("2027-06-12T14:00:00");

/*
  Henter HTML-elementene der vi skal vise
  dager, timer og minutter.
*/
const daysElement = document.getElementById("days");
const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");


/*
  Funksjonen regner ut hvor lang tid det er igjen
  fra nåværende tidspunkt til bryllupsdatoen.
*/
function updateCountdown() {
  // Dato og klokkeslett akkurat nå
  const now = new Date();

  /*
    getTime() gir antall millisekunder siden 1. januar 1970.
    Ved å trekke dem fra hverandre får vi antall millisekunder
    frem til bryllupet.
  */
  const difference = weddingDate.getTime() - now.getTime();

  /*
    Hvis bryllupet har startet eller datoen har passert,
    setter vi alle tall til 0.
  */
  if (difference <= 0) {
    daysElement.textContent = "0";
    hoursElement.textContent = "0";
    minutesElement.textContent = "0";
    return;
  }

  /*
    Antall millisekunder i:
    - ett minutt
    - én time
    - ett døgn
  */
  const oneMinute = 1000 * 60;
  const oneHour = oneMinute * 60;
  const oneDay = oneHour * 24;

  // Regner ut hele dager igjen
  const days = Math.floor(difference / oneDay);

  /*
    % betyr resten etter divisjon.

    Eksempel:
    Når vi har funnet hele dager, regner vi ut hvor
    mange timer som gjenstår etter disse dagene.
  */
  const hours = Math.floor((difference % oneDay) / oneHour);

  // Regner ut minutter etter hele timer
  const minutes = Math.floor((difference % oneHour) / oneMinute);

  /*
    textContent setter teksten inne i HTML-elementet.

    padStart(2, "0") gjør at for eksempel 8 blir til "08".
  */
  daysElement.textContent = days;
  hoursElement.textContent = String(hours).padStart(2, "0");
  minutesElement.textContent = String(minutes).padStart(2, "0");
}

/*
  Kjører nedtellingen med én gang siden lastes,
  så brukeren ikke trenger å vente ett minutt.
*/
updateCountdown();

/*
  Oppdaterer nedtellingen hvert minutt.

  60 000 millisekunder = 60 sekunder = 1 minutt.
*/
setInterval(updateCountdown, 60_000);


/*
  ------------------------------------------
  2. MOBILMENY
  ------------------------------------------

  På mobil viser HTML-en en hamburgerknapp.
  JavaScript åpner og lukker menyen når brukeren
  trykker på knappen.
*/

const menuButton = document.querySelector(".menu-button");
const navLinks = document.querySelector(".nav-links");


/*
  Sjekker at elementene finnes før vi bruker dem.

  Dette gjør at JavaScript ikke krasjer hvis du senere
  fjerner menyen fra HTML-en.
*/
if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    /*
      aria-expanded forteller skjermlesere om menyen er åpen.
      Vi leser den eksisterende verdien først.
    */
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";

    /*
      Hvis menyen var lukket blir den åpnet.
      Hvis den var åpen blir den lukket.
    */
    menuButton.setAttribute("aria-expanded", String(!isOpen));

    /*
      Endrer tekst som leses opp av skjermlesere.
    */
    menuButton.setAttribute(
      "aria-label",
      isOpen ? "Åpne meny" : "Lukk meny"
    );

    /*
      CSS-klassen .open gjør mobilmenyen synlig.
      CSS-klassen .menu-open på body stopper scrolling
      i bakgrunnen mens menyen er åpen.
    */
    navLinks.classList.toggle("open");
    document.body.classList.toggle("menu-open");
  });

  /*
    Når brukeren klikker på en lenke i mobilmenyen,
    lukker vi menyen automatisk.
  */
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      document.body.classList.remove("menu-open");

      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Åpne meny");
    });
  });
}


/*
  ------------------------------------------
  3. ANIMASJONER NÅR MAN SCROLLER
  ------------------------------------------

  Elementer med class="reveal" er gjennomsiktige
  og litt flyttet ned i CSS.

  Når de kommer inn på skjermen, legger JavaScript
  på class="visible". CSS gjør da at de toner inn.
*/

const revealElements = document.querySelectorAll(".reveal");


/*
  IntersectionObserver er en effektiv måte å sjekke
  om et element er synlig på skjermen.

  Det er bedre enn å lytte kontinuerlig på scroll.
*/
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      /*
        isIntersecting er true når elementet er synlig
        i nettleservinduet.
      */
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");

        /*
          Når animasjonen først er kjørt, trenger vi ikke
          følge med på dette elementet lenger.
        */
        observer.unobserve(entry.target);
      }
    });
  },
  {
    /*
      threshold: 0.12 betyr at omtrent 12 % av elementet
      må være synlig før animasjonen starter.
    */
    threshold: 0.12,
  }
);


/*
  Starter overvåkingen for alle elementer med .reveal.
*/
revealElements.forEach((element) => {
  observer.observe(element);
});


/*
  ------------------------------------------
  4. RSVP-SKJEMA
  ------------------------------------------

  Skjemaet gjør foreløpig dette:

  - Viser ekstra felt hvis gjesten kommer.
  - Viser ledsagerfelt dersom gjesten velger 2 personer.
  - Sjekker at nødvendige felt er fylt ut.
  - Viser en testmelding ved innsending.

  Det lagrer ikke data i database ennå.
*/

const form = document.getElementById("rsvp-form");
const formStatus = document.getElementById("form-status");

const attendanceInputs = document.querySelectorAll(
  'input[name="attendance"]'
);

const guestFields = document.getElementById("guest-fields");
const guestCount = document.getElementById("guestCount");
const guestNamesContainer = document.getElementById("guest-names-container");

/*
  Denne funksjonen kjører når gjesten velger:
  - "Ja, jeg kommer"
  - "Nei, jeg kan dessverre ikke komme"
*/
function updateGuestFields() {
  const attendance = document.querySelector(
    'input[name="attendance"]:checked'
  )?.value;

  const isComing = attendance === "ja";

  // Viser eller skjuler alle feltene som gjelder gjester.
  guestFields.hidden = !isComing;

  if (!isComing) {
    // Tømmer antall og navn dersom gjesten velger "nei".
    guestCount.value = "1";
    guestNamesContainer.innerHTML = "";
    return;
  }

  renderGuestNameFields();
}


/*
  Lytter etter endring på begge radio-knappene.
*/
attendanceInputs.forEach((input) => {
  input.addEventListener("change", updateGuestFields);
});


/*
  Lager ett navnefelt per person.

  Hvis brukeren skriver 3 i antall personer,
  dukker det opp tre felt:
  - Navn på person 1
  - Navn på person 2
  - Navn på person 3
*/
function renderGuestNameFields() {
  let numberOfGuests = Number(guestCount.value);

  /*
    Hindrer ugyldige tall. Maks 20 er bare en praktisk
    grense; du kan endre eller fjerne max="20" i HTML.
  */
  if (!Number.isInteger(numberOfGuests) || numberOfGuests < 1) {
    numberOfGuests = 1;
    guestCount.value = "1";
  }

  const existingNames = Array.from(
    guestNamesContainer.querySelectorAll(".guest-name-input")
  ).map((input) => input.value);

  guestNamesContainer.innerHTML = "";

  for (let i = 0; i < numberOfGuests; i += 1) {
    const group = document.createElement("div");
    group.className = "form-group";

    const label = document.createElement("label");
    label.htmlFor = `guest-name-${i}`;
    label.textContent = `Fullt navn på person ${i + 1}`;

    const input = document.createElement("input");
    input.id = `guest-name-${i}`;
    input.className = "guest-name-input";
    input.type = "text";
    input.name = "guestNames[]";
    input.autocomplete = "name";
    input.placeholder = `Navn på person ${i + 1}`;
    input.required = true;

    /*
      Beholder allerede skrevet navn dersom brukeren
      for eksempel endrer fra 2 til 3 personer.
    */
    input.value = existingNames[i] || "";

    group.append(label, input);
    guestNamesContainer.appendChild(group);
  }
}

/*
  Kjører mens brukeren skriver og når feltet mister fokus.
  Dermed oppdateres navnefeltene med en gang antallet endres.
*/
guestCount.addEventListener("input", renderGuestNameFields);
guestCount.addEventListener("change", renderGuestNameFields);


/*
  Denne funksjonen kjører når gjesten trykker
  på knappen "Send svar".
*/
form.addEventListener("submit", (event) => {
  /*
    Hindrer nettleseren i å laste siden på nytt.
    Dette er nødvendig når vi vil behandle data
    med JavaScript først.
  */
  event.preventDefault();

  // Henter og fjerner mellomrom før/etter navnet
  const name = document.getElementById("name").value.trim();

  // Finner "ja" eller "nei" fra valgt radio-knapp
  const attendance = document.querySelector(
    'input[name="attendance"]:checked'
  )?.value;


  /*
    ------------------------------------------
    VALIDERING
    ------------------------------------------

    Vi sjekker om nødvendige felt er fylt ut.
    Hvis noe mangler, viser vi en feilmelding
    og stopper resten av funksjonen med return.
  */

  if (!name) {
    formStatus.textContent = "Skriv inn fullt navn.";
    formStatus.className = "form-status error";

    // Flytter markøren direkte til navnefeltet
    document.getElementById("name").focus();
    return;
  }

  if (!attendance) {
    formStatus.textContent = "Velg om du kommer eller ikke.";
    formStatus.className = "form-status error";
    return;
  }

  if (attendance === "ja" && !guestCount.value) {
    formStatus.textContent = "Velg antall personer.";
    formStatus.className = "form-status error";

    guestCount.focus();
    return;
  }

/*
  Henter alle navnefeltene som JavaScript har laget.
*/
const guestNameInputs = document.querySelectorAll(".guest-name-input");

/*
  Sjekker at alle personer har fått et navn.
*/
if (attendance === "ja") {
  for (const input of guestNameInputs) {
    if (!input.value.trim()) {
      formStatus.textContent = "Skriv inn fullt navn på alle som kommer.";
      formStatus.className = "form-status error";
      input.focus();
      return;
    }
  }
}


  /*
    ------------------------------------------
    DATAENE SOM SKAL LAGRES SENERE
    ------------------------------------------

    Dette objektet samler alle verdiene fra skjemaet.

    Når du senere kobler til PHP og MySQL,
    sender du dette objektet med fetch().
  */
  const rsvpData = {
    name: name,
    attendance: attendance,

    /*
      Antall settes bare når personen kommer.
      Number() gjør teksten "2" om til tallet 2.
    */
    guestCount: attendance === "ja" ? Number(guestCount.value) : null,

    /*
  Gjør alle navnefeltene om til en liste med navn.
  Eksempel: ["Ola Nordmann", "Kari Nordmann", "Per Hansen"]
  */
    guestNames: Array.from(
      document.querySelectorAll(".guest-name-input")
    ).map((input) => input.value.trim()),

    allergies: document.getElementById("allergies").value.trim(),

    message: document.getElementById("message").value.trim(),
  };

  /*
    Dette skriver dataene i nettleserens developer console.
    Du kan åpne den med F12 i de fleste nettlesere.

    Dette er kun nyttig mens du tester.
    Fjern linjen når PHP/MySQL er koblet på.
  */
  console.log("RSVP-data som ville blitt sendt:", rsvpData);


  /*
    ------------------------------------------
    MIDLERTIDIG TESTMELDING
    ------------------------------------------

    Foreløpig lagrer vi ikke rsvpData noe sted.
    Derfor viser vi bare en tydelig testmelding.
  */
  formStatus.textContent =
    "Takk! Dette er foreløpig en test. Svaret er ikke lagret i database ennå.";

  formStatus.className = "form-status success";


  /*
    Tømmer hele skjemaet etter en vellykket test.
  */
  form.reset();

  /*
    Skjuler gjestefeltene igjen etter reset.
  */
  guestFields.hidden = true;
});

/*
  ------------------------------------------
  6. ÅPNINGSANIMASJON:
     BALLONGER OG FYRVERKERI
  ------------------------------------------

  Animasjonen kjører kun når nettsiden åpnes.
  Den respekterer også innstillingen "redusert bevegelse"
  for brukere som ikke ønsker animasjoner.
*/

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (!prefersReducedMotion) {
  const hero = document.querySelector(".hero");
  const fireworksCanvas = document.getElementById("fireworks-canvas");

  /*
    Lager dekorative ballonger inne i hero-seksjonen.
  */
  function createOpeningBalloons() {
    const balloonColors = [
      "#f4c6c2",
      "#d99aa1",
      "#e8d7b7",
      "#c78b94",
      "#f3dfdc",
      "#b87882",
    ];

    const numberOfBalloons = 9;

    for (let i = 0; i < numberOfBalloons; i += 1) {
      const balloon = document.createElement("div");

      balloon.className = "opening-balloon";

      /*
        Hver ballong får tilfeldig farge, posisjon,
        størrelse og hastighet.
      */
      balloon.style.left = `${Math.random() * 100}%`;
      balloon.style.backgroundColor =
        balloonColors[Math.floor(Math.random() * balloonColors.length)];

      balloon.style.animationDuration = `${7 + Math.random() * 5}s`;
      balloon.style.animationDelay = `${Math.random() * 1.5}s`;

      const size = 0.75 + Math.random() * 0.55;
      balloon.style.transform = `scale(${size})`;

      hero.appendChild(balloon);
    }
  }

  /*
    Fyrverkeri tegnes i et canvas-element.

    Et canvas er som en tom flate JavaScript kan tegne
    prikker, linjer og former på.
  */
  function startFireworks() {
    const context = fireworksCanvas.getContext("2d");
    const particles = [];

    /*
      Tilpasser canvaset til skjermens størrelse.
      devicePixelRatio gjør at fyrverkeriet blir skarpt
      også på skjermer med høy oppløsning.
    */
    function resizeCanvas() {
      const pixelRatio = window.devicePixelRatio || 1;

      fireworksCanvas.width = window.innerWidth * pixelRatio;
      fireworksCanvas.height = window.innerHeight * pixelRatio;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    resizeCanvas();

    /*
      Lager én eksplosjon med mange små partikler.
    */
    function createFirework(x, y) {
      const colors = [
        "#ffffff",
        "#f7d7d1",
        "#f4c6c2",
        "#e6bc77",
        "#d99aa1",
      ];

      const color = colors[Math.floor(Math.random() * colors.length)];
      const particleCount = 55;

      for (let i = 0; i < particleCount; i += 1) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = 1.5 + Math.random() * 4.5;

        particles.push({
          x,
          y,
          velocityX: Math.cos(angle) * speed,
          velocityY: Math.sin(angle) * speed,
          gravity: 0.035,
          friction: 0.975,
          alpha: 1,
          decay: 0.012 + Math.random() * 0.01,
          size: 1.5 + Math.random() * 2,
          color,
        });
      }
    }

    /*
      Oppdaterer posisjonen til hver partikkel og tegner den.
    */
    function animateFireworks() {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const particle = particles[i];

        particle.velocityX *= particle.friction;
        particle.velocityY *= particle.friction;
        particle.velocityY += particle.gravity;

        particle.x += particle.velocityX;
        particle.y += particle.velocityY;
        particle.alpha -= particle.decay;

        if (particle.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);

        context.fillStyle = particle.color;
        context.globalAlpha = particle.alpha;
        context.fill();
      }

      context.globalAlpha = 1;

      /*
        Fortsetter å animere så lenge det finnes partikler.
      */
      if (particles.length > 0) {
        requestAnimationFrame(animateFireworks);
      }
    }

    /*
      Fyrverkeriet starter litt etter litt, slik at det
      ikke kommer alt på én gang.
    */
    setTimeout(() => createFirework(window.innerWidth * 0.25, window.innerHeight * 0.3), 250);
    setTimeout(() => createFirework(window.innerWidth * 0.75, window.innerHeight * 0.25), 650);
    setTimeout(() => createFirework(window.innerWidth * 0.5, window.innerHeight * 0.42), 1050);
    setTimeout(() => createFirework(window.innerWidth * 0.2, window.innerHeight * 0.48), 1450);
    setTimeout(() => createFirework(window.innerWidth * 0.82, window.innerHeight * 0.45), 1750);

    animateFireworks();

    window.addEventListener("resize", resizeCanvas);
  }

  createOpeningBalloons();
  startFireworks();
}
/*
  ------------------------------------------
  5. SENERE: KOBLING TIL PHP / MYSQL
  ------------------------------------------

  Når du har laget api/rsvp.php, kan du erstatte
  testmeldingen med noe i denne retningen:

  try {
    const response = await fetch("api/rsvp.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(rsvpData)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Noe gikk galt.");
    }

    formStatus.textContent = result.message;
    formStatus.className = "form-status success";

    form.reset();
    guestFields.hidden = true;
    companionField.hidden = true;
  } catch (error) {
    formStatus.textContent =
      error.message || "Kunne ikke sende svaret. Prøv igjen senere.";

    formStatus.className = "form-status error";
  }

  Ikke lim inn denne delen før PHP-filen finnes.
*/
