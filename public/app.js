const statesData = {
  AC: ["Rio Branco", "Cruzeiro do Sul", "Sena Madureira"],
  AL: ["Maceió", "Arapiraca", "Palmeira dos Índios"],
  AP: ["Macapá", "Santana", "Laranjal do Jari"],
  AM: ["Manaus", "Parintins", "Itacoatiara"],
  BA: ["Salvador", "Feira de Santana", "Vitória da Conquista"],
  CE: ["Fortaleza", "Caucaia", "Juazeiro do Norte"],
  DF: ["Brasília"],
  ES: ["Vitória", "Vila Velha", "Serra"],
  GO: ["Goiânia", "Aparecida de Goiânia", "Anápolis"],
  MA: ["São Luís", "Imperatriz", "São José de Ribamar"],
  MT: ["Cuiabá", "Várzea Grande", "Rondonópolis"],
  MS: ["Campo Grande", "Dourados", "Três Lagoas"],
  MG: ["Belo Horizonte", "Uberlândia", "Contagem"],
  PA: ["Belém", "Ananindeua", "Santarém"],
  PB: ["João Pessoa", "Campina Grande", "Santa Rita"],
  PR: ["Curitiba", "Londrina", "Maringá"],
  PE: ["Recife", "Jaboatão dos Guararapes", "Olinda"],
  PI: ["Teresina", "Parnaíba", "Picos", "Piripiri"],
  RJ: ["Rio de Janeiro", "São Gonçalo", "Duque de Caxias"],
  RN: ["Natal", "Mossoró", "Parnamirim"],
  RS: ["Porto Alegre", "Caxias do Sul", "Pelotas"],
  RO: ["Porto Velho", "Ji-Paraná", "Ariquemes"],
  RR: ["Boa Vista", "Rorainópolis", "Caracaraí"],
  SC: ["Florianópolis", "Joinville", "Blumenau"],
  SP: ["São Paulo", "Guarulhos", "Campinas"],
  SE: ["Aracaju", "Nossa Senhora do Socorro", "Lagarto"],
  TO: ["Palmas", "Araguaína", "Gurupi"],
};

function filterHistory() {
    const search = document.getElementById("historySearch").value.toLowerCase();
    const dateFilter = document.getElementById("historyDateFilter").value;
    const stateFilter = document.getElementById("historyStateFilter").value;

    const rows = document.querySelectorAll("#historyTableBody tr");

    rows.forEach(row => {
        const sender = row.querySelector("td:nth-child(1)")?.textContent.toLowerCase() || "";
        const recipient = row.querySelector("td:nth-child(2)")?.textContent.toLowerCase() || "";
        const subject = row.querySelector("td:nth-child(3)")?.textContent.toLowerCase() || "";
        const date = row.querySelector("td:nth-child(4)")?.textContent.trim() || "";
        const localField = row.querySelector("td:nth-child(5)")?.textContent.trim() || "";

        const state = localField.split("/")[0].trim();

        let matchesSearch =
            sender.includes(search) ||
            recipient.includes(search) ||
            subject.includes(search) ||
            localField.toLowerCase().includes(search);

        let matchesDate = !dateFilter || date === dateFilter;

        let matchesState = stateFilter === "all" || state === stateFilter;

        if (matchesSearch && matchesDate && matchesState) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}



async function loadCities() {
  const state = document.getElementById("state").value;
  const citySelect = document.getElementById("city");

  citySelect.innerHTML = "<option value='all'>Todas as Cidades</option>";

  if (state === "all") return;

  try {
    const res = await fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`
    );
    const data = await res.json();

    data.forEach(cidade => {
      const option = document.createElement("option");
      option.value = cidade.nome;
      option.textContent = cidade.nome;
      citySelect.appendChild(option);
    });

  } catch (err) {
    console.error("Erro ao carregar cidades do IBGE:", err);
  }
}

let emails = [];
const charts = {};

async function loadEmails() {
  const res = await fetch("/api/emails");
  emails = await res.json();
}

async function createEmail(email) {
  await fetch("/api/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(email)
  });
}

async function updateEmailClassification(id, state, city) {
  await fetch(`/api/emails/${id}/classify`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state, city })
  });
}

async function removeEmail(id) {
  await fetch(`/api/emails/${id}`, { method: "DELETE" });
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadEmails();
  initializeApp();
  setupNavigation();
  setupSidebar();
  updateDashboard();

  setInterval(async () => {
    await loadEmails();
    renderPendingEmails();
    renderHistory();
    updateDashboard();
  }, 30000);
});


function initializeApp() {
  document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("pt-BR");

  const today = new Date().toISOString().split("T")[0];
  const now = new Date().toTimeString().split(" ")[0].substring(0, 5);
  document.getElementById("emailDate").value = today;
  document.getElementById("emailTime").value = now;
}

function setupNavigation() {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo(item.dataset.page);
    });
  });
}

function setupSidebar() {
    const toggle = document.getElementById("sidebarToggle");
    const sidebar = document.getElementById("sidebar");

    if (toggle && sidebar) {
        toggle.addEventListener("click", () => {
            sidebar.classList.toggle("active");
        });
    }
}


function navigateTo(page) {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
    if (item.dataset.page === page) item.classList.add("active");
  });

  document.querySelectorAll(".page").forEach((p) =>
    p.classList.remove("active")
  );
  document.getElementById(page).classList.add("active");

  if (page === "dashboard") updateDashboard();
  if (page === "pendentes") renderPendingEmails();
  if (page === "historico") renderHistory();

  if (window.innerWidth <= 768)
    document.getElementById("sidebar").classList.remove("active");
}

function updateDashboard() {
  const total = emails.length;
  const classified = emails.filter((e) => e.classified).length;
  const pending = total - classified;

  document.getElementById("totalEmails").textContent = total;
  document.getElementById("classifiedEmails").textContent = classified;
  document.getElementById("pendingEmails").textContent = pending;
  document.getElementById("pendingBadge").textContent = pending;

  updateStateChart();
  updateTrendChart();
  updateTopRecipients();
}

function updateStateChart() {
  const ctx = document.getElementById("stateChart");
  const counts = {};

  emails.filter((e) => e.state).forEach((e) => {
    counts[e.state] = (counts[e.state] || 0) + 1;
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);

  if (charts.stateChart) charts.stateChart.destroy();

  charts.stateChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: sorted.map((s) => s[0]),
      datasets: [{
        label: "E-mails",
        data: sorted.map((s) => s[1]),
        backgroundColor: "rgba(99,102,241,0.8)"
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });
}

async function syncEmails() {
  await fetch("/api/emails/sync");
  await loadEmails();
  renderPendingEmails();
  renderHistory();
  updateDashboard();
}


function updateTrendChart() {
  const ctx = document.getElementById("trendChart");
  const days = [];
  const values = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];

    days.push(d.toLocaleDateString("pt-BR"));
    values.push(emails.filter((e) => e.date.split("T")[0] === key).length);
  }

  if (charts.trendChart) charts.trendChart.destroy();

  charts.trendChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: days,
      datasets: [{
        label: "E-mails",
        data: values,
        borderColor: "rgba(99,102,241,1)",
        fill: true
      }]
    },
    options: { responsive: true }
  });
}

function updateTopRecipients() {
  const counts = {};

  emails.forEach((email) => {
    counts[email.recipient] = (counts[email.recipient] || 0) + 1;
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const container = document.getElementById("topRecipients");
  container.innerHTML = sorted
    .map(
      (item, i) => `
    <div class="top-item">
      <div class="top-rank">${i + 1}</div>
      <div class="top-details">
        <div class="top-email">${item[0]}</div>
        <div class="top-count">${item[1]} e-mails</div>
      </div>
    </div>
  `
    )
    .join("");
}

function renderPendingEmails() {
  const pending = emails.filter((e) => !e.classified);
  const tbody = document.getElementById("pendingTableBody");

  if (pending.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="7" style="padding:30px;text-align:center;">Nenhum email pendente</td></tr>
    `;
    return;
  }

  tbody.innerHTML = pending
    .map(
      (e) => `
    <tr data-id="${e.id}">
      <td><input type="checkbox" class="pending-checkbox"></td>
      <td>${e.sender}</td>
      <td>${e.recipient}</td>
      <td>${new Date(e.date).toLocaleDateString("pt-BR")}</td>
      <td>
        <select class="state-select" onchange="updatePendingState(${e.id})">
          <option value="">-</option>
          ${Object.keys(statesData)
            .map((st) => `<option value="${st}">${st}</option>`)
            .join("")}
        </select>
      </td>
      <td>
        <select class="city-select" disabled>
          <option value="">-</option>
        </select>
      </td>
      <td>
        <button class="icon-btn" onclick="classifyEmail(${e.id})">✔</button>
      </td>
    </tr>
  `
    )
    .join("");
}

function updatePendingState(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const state = row.querySelector(".state-select").value;
  const citySelect = row.querySelector(".city-select");

  if (!state) {
    citySelect.disabled = true;
    citySelect.innerHTML = "<option>-</option>";
    return;
  }

  citySelect.disabled = false;
  citySelect.innerHTML =
    `<option value="">Selecione</option>` +
    statesData[state].map((c) => `<option>${c}</option>`).join("");
}

async function classifyEmail(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const state = row.querySelector(".state-select").value;
  const city = row.querySelector(".city-select").value;

  if (!state || !city) {
    showToast("Selecione estado e cidade", "error");
    return;
  }

  await updateEmailClassification(id, state, city);
  await loadEmails();

  renderPendingEmails();
  updateDashboard();
  showToast("Classificado!", "success");
}

async function saveAllPending() {
  const rows = document.querySelectorAll("#pendingTableBody tr");
  let total = 0;

  for (const row of rows) {
    const id = Number(row.dataset.id);
    const state = row.querySelector(".state-select").value;
    const city = row.querySelector(".city-select").value;

    if (state && city) {
      await updateEmailClassification(id, state, city);
      total++;
    }
  }

  await loadEmails();
  renderPendingEmails();
  updateDashboard();

  if (total > 0)
    showToast(`${total} classificados!`, "success");
  else
    showToast("Nenhum classificado!", "error");
}


function renderHistory() {
  const classified = emails.filter((e) => e.classified);
  const tbody = document.getElementById("historyTableBody");

  if (classified.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="6" style="text-align:center;padding:30px;">Nenhum classificado</td></tr>
    `;
    return;
  }

  tbody.innerHTML = classified
    .map(
      (e) => `
    <tr>
      <td>${e.sender}</td>
      <td>${e.recipient}</td>
      <td>${e.subject}</td>
      <td>${new Date(e.date).toLocaleDateString("pt-BR")}</td>
      <td>${e.state} / ${e.city}</td>
      <td><button onclick="deleteEmail(${e.id})" class="icon-btn danger">🗑</button></td>
    </tr>
  `
    )
    .join("");
}

async function deleteEmail(id) {
  if (!confirm("Excluir?")) return;

  await removeEmail(id);
  await loadEmails();
  renderHistory();
  updateDashboard();

  showToast("Excluído!", "success");
}

async function handleSubmit(e) {
  e.preventDefault();

  const email = {
    id: Date.now(),
    sender: sender.value,
    recipient: recipient.value,
    subject: subject.value,
    body: body.value,
    date: new Date(emailDate.value + " " + emailTime.value).toISOString(),
    state: state.value,
    city: city.value,
    classified: true
  };

  await createEmail(email);
  await loadEmails();

  updateDashboard();
  renderHistory();

  showToast("Cadastrado!", "success");

  resetForm();
  setTimeout(() => navigateTo("historico"), 700);
}

function resetForm() {
  document.getElementById("emailForm").reset();
  city.disabled = true;
}

function showToast(msg, type = "info") {
  const container = document.getElementById("toastContainer");
  const div = document.createElement("div");
  div.className = `toast ${type}`;
  div.innerText = msg;
  container.appendChild(div);
  setTimeout(() => {
    div.style.opacity = "0";
    setTimeout(() => div.remove(), 300);
  }, 2500);
}

window.onclick = (e) => {
  const modal = document.getElementById("detailsModal");
  if (e.target === modal) closeModal();
};
