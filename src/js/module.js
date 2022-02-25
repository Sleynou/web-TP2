"use strict";

/** la page d'accueil du site */
const pageParDefaut = "accueil";

const domParser = new DOMParser();

class Site {
    /** le nom de l'entreprise */
    #nomDuSite = document.title;

    constructor () {
        globalThis.addEventListener("hashchange", this.changementPage.bind(this), false);
        this.changementPage();
    }

    /** retourne le titre de la page actuelle */
    get titreDePage () {
        return document.querySelector("main h1:first-of-type");
    }

    /** remplace le titre de la page actuelle */
    set titreDePage (titre) {
        return this.titreDePage.replaceWith(titre);
    }

    /** retourne la balise qui contient le contenu des pages */
    get contenuPrincipal () {
        return document.querySelector("main > div:first-of-type");
    }

    /** remplace le contenu principal par d'autres éléments */
    set contenuPrincipal (remplacement) {
        return this.contenuPrincipal.replaceChildren(remplacement);
    }

    /** modifie la description de la page */
    set description (description) {
        return document.querySelector("meta[name=description]").setAttribute("content", description);
    }

    get pageActuelle () {
        return document.location.hash.trim().toLowerCase().split("#/")[1] ?? "";
    }

    set pageActuelle (pageDemandee) {
        document.location.hash = `#/${pageDemandee}`;
    }

    set pageMenuActive (pageDemandee) {
        for (const lien of document.querySelectorAll("nav menu li")) {
            const destination = lien.querySelector("a").href.split("#/")[1] || pageParDefaut;

            if (destination == pageDemandee) {
                lien.classList.add("active");
            } else {
                lien.classList.remove("active");
            }
        }
    }

    /** cette méthode est appelée quand l'adresse de la page change */
    changementPage () {
        const pageDemandee = this.pageActuelle || pageParDefaut;

        // on commence par indiquer que la page est en cours de chargement:
        document.body.classList.add("chargement");

        // ensuite on charge la nouvelle page:
        fetch(`pages/${pageDemandee}.html`)
        .then(reponse => reponse.text())
        .then(texte => domParser.parseFromString(texte, "text/html"))
        .then(html => {
            // on analyse notre nouvelle page:
            const titreDePage = html.querySelector("h1:first-of-type");
            const description = html.querySelector("details:first-of-type").innerText;
            const corpsDePage = html.querySelector("main:first-of-type");

            // on vient remplacer les éléments actuels par nos nouveaux éléments:
            document.title = `${titreDePage.innerText} \u2013 ${this.#nomDuSite}`; // ne nouveau titre du site
            this.titreDePage = titreDePage; // le nouveau titre de la page
            this.description = description; // la nouvelle description [SEO]
            this.contenuPrincipal = corpsDePage; // le nouveau contenu de la page
            this.pageMenuActive = pageDemandee; // on change la page active dans le menu
        })
        .catch(err => {
            document.title = `Erreur 404 \u2013 ${this.#nomDuSite}`;

            const titreDePage = document.createElement("h1");
            titreDePage.innerText = "Page introuvable";

            this.titreDePage = titreDePage;
            this.contenuPrincipal = "La page demandée n'existe pas.";
        })
        .finally(() => {
            document.body.classList.remove("chargement");
        });
    }
}

new Site();
