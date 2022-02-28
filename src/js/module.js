/**
 * @file Ce module contrôle la navigation intéractive du site
 * @author Pascal Breton Beauchamp
 */

// on définit un type JSDoc pour les identifiants de page:
/**
 * l'identifiant textuel d'une page; il s'agit du nom de son fichier, sans l'extension .html
 * @typedef {string} IdentifiantPage
 */

/** l'identifiant de la page d'accueil du site */
const pageParDefaut = (/** @type {IdentifiantPage} */ "accueil"); //< page sur laquelle on arrive par défaut

/** l'analyseur de fichier HTML qu'on utilise pour lire les pages du site */
const domParser = new DOMParser();

/** la classe principale du site */
class Site {
    /** le nom de l'entreprise */
    #nomDuSite = document.title;

    /** ce constructeur est exécuté au chargement du site */
    constructor () {
        /** on surveille le changement de fragment d'adresse du site */
        globalThis.addEventListener("hashchange", this.changementPage.bind(this), false);

        /** on charge la page initiale  */
        this.changementPage();
    }

    /**
     * retourne le titre de l'en-tête de la page sur laquelle on se trouve
     *
     * @returns {string} le titre de la page actuelle
     */
    get titreDePage () {
        return document.querySelector("main h1:first-of-type");
    }

    /**
     * change le titre de l'en-tête de la page sur laquelle on se trouve
     *
     * @param {string} titre - le nouveau titre de page à utiliser
     */
    set titreDePage (titre) {
        return this.titreDePage.replaceWith(titre);
    }

    /**
     * retourne la balise qui contient le contenu des pages
     *
     * @returns {HTMLDivElement} la balise du corps de page
     */
    get contenuPrincipal () {
        return document.querySelector("main > div:first-of-type");
    }

    /**
     * remplace le contenu principal par d'autres éléments
     *
     * @param {NodeList} remplacement - les balises à utiliser comme remplacement
     */
    set contenuPrincipal (remplacement) {
        return this.contenuPrincipal.replaceChildren(...remplacement);
    }

    /**
     * modifie la balise de métadonnées de description de la page
     *
     * @param {string} description - la nouvelle description
     */
    set description (description) {
        return document.querySelector("meta[name=description]").setAttribute("content", description);
    }

    /**
     * retourne l'identifiant de la page actuelle sur laquelle on se trouve
     *
     * @returns {IdentifiantPage} l'identifiant de la page
     */
    get pageActuelle () {
        const fragmentAdresse = document.location.hash // on obtient le fragment d'adresse
            .trim().toLowerCase().split("#/")[1]?.replaceAll(/[^a-z_-]/g, ""); // on le nettoie
        return fragmentAdresse === "" ? pageParDefaut : fragmentAdresse;
    }

    /**
     * change l'identifiant de la page, ce qui a pour effet secondaire de changer la page actuelle
     *
     * @param {IdentifiantPage} pageDemandee - l'identifiant de la nouvelle page
     * @fires globalThis#hashchange
     */
    set pageActuelle (pageDemandee) {
        if (!pageDemandee || pageDemandee == pageParDefaut) {
            // on enlève tout simplement le fragment pour la page d'accueil:
            document.location.hash = "";
        } else {
            document.location.hash = `#/${pageDemandee}`;
        }
    }

    /**
     * change la page active dans le menu de navigation du site
     *
     * @param {IdentifiantPage} pageDemandee - l'identifiant de la nouvelle page active
     */
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

    /**
     * cette méthode est appelée quand l'adresse de la page change
     *
     * @async
     * @listens globalThis#hashchange
     */
    changementPage () {
        /** la page vers laquelle on désire aller  */
        const pageDemandee = (/** @type {IdentifiantPage} */ this.pageActuelle || pageParDefaut);

        // on commence par indiquer à l'utilisateur que la nouvelle page est en cours de chargement:
        document.body.classList.add("chargement");

        // ensuite, on charge la nouvelle page:
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
            this.contenuPrincipal = corpsDePage.childNodes; // le nouveau contenu de la page
            this.pageMenuActive = pageDemandee; // on change la page active dans le menu
        })
        .catch(err => {
            document.title = `Erreur 404 \u2013 ${this.#nomDuSite}`;

            // on crée une page 404 de toutes pièces:
            const titreDePage = document.createElement("h1");
            titreDePage.innerText = "Page introuvable";

            this.titreDePage = titreDePage;
            this.contenuPrincipal = "La page demandée n'existe pas.";
        })
        .finally(() => {
            // on indique que la page a fini de charger:
            document.body.classList.remove("chargement");
        });
    }
}

// on initialise notre site:
new Site();
