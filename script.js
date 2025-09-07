// Charger les traductions en fonction de la langue sélectionnée
async function loadTranslations(lang) {
    try {
        const response = await fetch('content.json');
        const translations = await response.json();
        
        document.querySelectorAll("[data-key]").forEach(element => {
            const key = element.getAttribute("data-key");
            if (translations[key] && translations[key][lang]) {
                element.innerHTML = translations[key][lang].replace(/\n/g, '<br>');
            }
        });
    } catch (error) {
        console.error("Erreur lors du chargement des traductions :", error);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    fetch("footer.html") // Charge le fichier footer.html
        .then(response => response.text()) // Convertit la réponse en texte HTML
        .then(html => {
            document.getElementById("footerContainer").innerHTML = html; // Insère le HTML dans la page principale
            
            // Appliquer la traduction après insertion du footer
            const lang = localStorage.getItem('lang') || "fr";
            loadTranslations(lang);
        })
        .catch(error => console.error("Erreur lors du chargement du footer :", error));

    // Gérer le changement de langue
    const toggleButton = document.getElementById('toggleButton');
    if (toggleButton) {
        toggleButton.value = localStorage.getItem('lang') || "fr";
        loadTranslations(toggleButton.value);

        toggleButton.addEventListener('change', function() {
            localStorage.setItem('lang', toggleButton.value);
            loadTranslations(toggleButton.value);
        });
    }
});

document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch("resources.json");
        const data = await response.json();
        const resources = data.resources;

        // 🎯 1. Auto-remplissage des liens avec resource-key
        document.querySelectorAll("a[resource-key]").forEach(link => {
            const key = link.getAttribute("resource-key");
            const resource = resources.find(res => res["resource-key"] === key);

            if (resource) {
                link.textContent = resource.title; // Affiche le titre
                link.href = resource.url; // Met l'URL
                link.target = "_blank"; // Ouvre dans un nouvel onglet
            } else {
                console.warn(`Ressource non trouvée pour resource-key="${key}"`);
            }
        });

        // 🎯 2. Affichage de la liste des ressources filtrables
        const resourceListContainer = document.getElementById("resourceList");
        const categoryFilter = document.getElementById("categoryFilter");

        // Fonction pour afficher les ressources filtrées
        function displayResources(filterCategory = "all") {
            resourceListContainer.innerHTML = ""; // Vide la liste

            const filteredResources = (filterCategory === "all") 
                ? resources 
                : resources.filter(res => res.category === filterCategory);

            if (filteredResources.length === 0) {
                resourceListContainer.innerHTML = "<p>Aucune ressource trouvée.</p>";
                return;
            }

            filteredResources.forEach(resource => {
                const listItem = document.createElement("li");
                listItem.innerHTML = `<a href="${resource.url}" target="_blank">${resource.title}</a>`;
                resourceListContainer.appendChild(listItem);
            });
        }

        // Générer les options du filtre
        const categories = [...new Set(resources.map(res => res.category))];
        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category === "all" ? "Toutes les catégories" : category;
            categoryFilter.appendChild(option);
        });

        // Écouteur pour changer la catégorie
        categoryFilter.addEventListener("change", (e) => {
            displayResources(e.target.value);
        });

        // Affichage initial
        displayResources();
    } catch (error) {
        console.error("Erreur lors du chargement des ressources JSON :", error);
    }
});

// Affichage dynamique du menu responsive
function toggleList() {
    const list = document.getElementById('responsive-list');
    if (list) {
        list.style.display = (list.style.display === 'none' || list.style.display === '') ? 'flex' : 'none';
    }
}

// Réajuster le menu en fonction de la taille de l’écran
window.addEventListener('resize', () => {
    const list = document.getElementById('responsive-list');
    if (list) {
        list.style.display = (window.innerWidth > 768) ? 'flex' : 'none';
    }
});

// Fermer les modals avec Échap
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.add('hidden'));
  }
});

function showModal(modalID) {
    document.getElementById(modalID).classList.remove("hidden");
}
function closeModal(modalID) {
    document.getElementById(modalID).classList.add("hidden");
}
const cvLink = document.getElementById("cvLink");

  // Fonction pour mettre à jour le lien en fonction de la langue sélectionnée
  function updateCVLink() {
    if (toggleButton.value === "fr") {
      cvLink.href = "assets/documents/CV_CédricRouillé.pdf";
    } else if (toggleButton.value === "en") {
      cvLink.href = "assets/documents/CV_CédricRouillé_en.pdf";
    }
  }

async function renderProjectToHTML(annee, projet, lang = 'fr') {
  try {
    const response = await fetch('traces.json');
    const data = await response.json();
    const project = data[annee]?.[projet];

    if (!project) {
      console.error("Projet non trouvé");
      return;
    }

    // Injecter le titre
    const titleDiv = document.querySelector('.zone.title');
    titleDiv.innerHTML = `<h1>${project['project-title']?.[lang] || ''}</h1>`;

    // Injecter l'objectif + description
    const goalDescDiv = document.querySelectorAll('.zone')[1];
    goalDescDiv.innerHTML = `
      <h2>Objectif :</h2><p class="p">${project['project-goal']?.[lang] || ''}</p>
      <h2>Description :</h2><p class="p">${(project['project-description']?.[lang] || '').replace(/\n/g, '<br>')}</p>
    `;

    // Injecter le tableau
    const tableDiv = document.querySelectorAll('.zone')[2];
    const table = document.createElement('table');
    table.id = 'tableau';
    table.style.width = '97%';

    // Création de l'entête
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = project['table-header'];

    const headerKeys = ['col1-name', 'col2-name', 'col3-name', 'col4-name'];
    const widths = ['40%', '20%', '25%', '15%'];

    headerKeys.forEach((key, i) => {
      const th = document.createElement('th');
      th.textContent = headers[key]?.[lang] || '';
      th.style.width = widths[i];
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Création du corps
    const tbody = document.createElement('tbody');
    for (let tache = 1; tache <= 50; tache++) {
      const task = project[tache];
      if (!task) continue;

      const row = document.createElement('tr');

      // Colonne 1 : tâche
      const col1 = document.createElement('td');
      col1.innerHTML = `<strong>${task['task-title']?.[lang] || ''}</strong><br>${task['task-goal']?.[lang] || ''}`;
      col1.style.width = widths[0];

      // Colonne 2 : ressources
      const col2 = document.createElement('td');
      col2.innerHTML = (task['resource-keys'] || []).filter(r => r).join('<br>');
      col2.style.width = widths[1];

      // Colonne 3 : trace image
      const col3 = document.createElement('td');
      const img = document.createElement('img');
      img.src = `assets/traces/trace${annee}.${projet}.${tache}.png`;
      img.alt = `trace${annee}.${projet}.${tache}`;
      img.classList.add('trace-img');
      img.style.maxWidth = '100%';
      col3.appendChild(img);
      col3.style.width = widths[2];

      // Colonne 4 : autoévaluation
      const col4 = document.createElement('td');
      col4.style.borderLeft = `6px solid ${task.autoeval?.['pict-color'] || 'gray'}`;
      col4.innerHTML = (task.autoeval?.content?.[lang] || '').replace(/\n/g, '<br>');
      col4.style.width = widths[3];

      row.appendChild(col1);
      row.appendChild(col2);
      row.appendChild(col3);
      row.appendChild(col4);

      tbody.appendChild(row);
    }

    table.appendChild(tbody);
    tableDiv.innerHTML = ''; // Nettoyer avant insertion
    tableDiv.appendChild(table);

    // Injecter la conclusion
    const conclusionDiv = document.querySelectorAll('.zone')[3];
    conclusionDiv.innerHTML = `
      <h2>${project['project-conclusion-title']?.[lang] || ''}</h2>
      <p>${(project['project-conclusion']?.[lang] || '').replace(/\n/g, '<br>')}</p>
    `;

  } catch (err) {
    console.error('Erreur de chargement :', err);
  }
}

// Écouteur d'événements pour détecter le changement de langue
toggleButton.addEventListener("change", updateCVLink);

// Initialisation du lien au chargement de la page
updateCVLink();