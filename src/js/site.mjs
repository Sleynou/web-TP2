/**
 * @file Ce module contrôle la navigation intéractive du site
 * @author Pascal Breton Beauchamp
 * @license 0BSD
 */

import Page from "./page.mjs"; //< notre analyseur maison pour les pages

// on définit un type JSDoc pour les identifiants de page:
/**
 * l'identifiant textuel d'une page; il s'agit du nom de son fichier, sans l'extension .html
 * @typedef {string} IdentifiantPage
 */

/** l'identifiant de la page d'accueil du site */
const pageParDefaut = (/** @type {IdentifiantPage} */ "accueil"); //< page sur laquelle on arrive par défaut

/** l'identifiant de la page d'erreur 404 */
const page404 = (/** @type {IdentifiantPage} */ "@404");

/** le nom de l'entreprise */
const nomDuSite = document.title; // on l'obtient de la balise <title>



/** la classe principale du site */
class Site {
	/**
	 * le `ShadowRoot` qui contient nos sous-pages
	 * @type {?ShadowRoot}
	 */
	#conteneur;

	/**
	 * l'ensemble des `Page` du `Site`
	 * @type {Map<String,Page>}
	 */
	#pages = new Map();

	/** ce constructeur est exécuté au chargement du site */
	constructor () {
		/** on surveille le changement de fragment d'adresse du site */
		globalThis.addEventListener("hashchange", this.changementPage.bind(this), false);

		/** on charge la page initiale  */
		this.changementPage();

		/** on pré-cache les autres pages */
		this.toutCacher();
	}

	/**
	 * retourne le titre de l'en-tête de la page sur laquelle on se trouve
	 *
	 * @returns {HTMLHeadingElement} le titre de la page actuelle
	 */
	get titreDePage () {
		return document.querySelector("main > header h1:first-of-type");
	}

	/**
	 * change le titre de l'en-tête de la page sur laquelle on se trouve
	 *
	 * @param {string} titre - le nouveau titre de page à utiliser
	 */
	set titreDePage (titre) {
		document.title = `${titre} \u2013 ${nomDuSite}`; // le nouveau titre du site
		this.titreDePage.innerText = titre; // nouveau bandeau de titre
	}

	/**
	 * retourne la balise qui contient le contenu des pages
	 *
	 * @returns {HTMLDivElement} la balise du corps de page
	 */
	get contenuPrincipal () {
		return document.querySelector("main > .corps");
	}

	/**
	 * remplace le contenu principal par d'autres éléments
	 *
	 * @param {NodeList} remplacement - les balises à utiliser comme remplacement
	 */
	set contenuPrincipal (remplacement) {
		// si c'est le premier chargement d'une page, on crée un ShadowRoot:
		if (!this.#conteneur) {
			// on vide le contenu temporaire:
			this.contenuPrincipal.replaceChildren();

			// on crée une nouvelle arborescence:
			this.#conteneur = this.contenuPrincipal.attachShadow({mode: "closed"});
		}

		// on remplace le contenu du ShadowRoot par les balises de la nouvelle page:
		this.#conteneur.replaceChildren(...remplacement);
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
			.trim().toLowerCase().split("/")[1]?.replaceAll(/[^a-z0-9-]/g, ""); // on le nettoie
		return fragmentAdresse || pageParDefaut;
	}

	/**
	 * change la page active dans le menu de navigation du site
	 *
	 * @param {IdentifiantPage} pageDemandee - l'identifiant de la nouvelle page active
	 */
	set pageMenuActive (pageDemandee) {
		for (const lien of document.querySelectorAll("nav > .menu > li")) {
			const destination = lien.querySelector("a").href.split("#/")[1] || pageParDefaut;

			if (destination === pageDemandee) {
				lien.classList.add("active");
			} else {
				lien.classList.remove("active");
			}
		}
	}

	/**
	 * cette méthode est appelée quand l'adresse de la page change
	 *
	 * @listens globalThis#hashchange
	 */
	async changementPage () {
		if (!document.location.hash.startsWith("#/") && document.location.href.includes("#")) {
			// cas spécial: on désire seulement mettre le focus sur un élément
			return;
		}

		/** la page en cache, si elle existe */
		let pageEnCache = this.#pages.get(this.pageActuelle);

		// si la page n'est pas dans le cache, on la charge
		if (!pageEnCache) {
			pageEnCache = await this.cacherPage(this.pageActuelle);
		}

		// on active la page
		pageEnCache.activer();
	}

	/**
	 * cette méthode charge une page et l'ajoute au cache
	 *
	 * @param {IdentifiantPage} pageDemandee
	 * @returns {Promise<Page>} la nouvelle `Page`
	 */
	async cacherPage (pageDemandee) {
		// on obtient le fichier de la page:
		const reponse = await fetch(`pages/${pageDemandee}.html`);

		// on vérifie si la page existe:
		if (reponse.status === 404) {
			return this.#pages.get(page404) ?? await this.cacherPage(page404);
		}

		// on analyse le contenu de la nouvelle page:
		const nouvellePage = Page.depuis(this, pageDemandee, await reponse.text());

		this.#pages.set(pageDemandee, nouvellePage); // on ajoute la page au au cache
		return nouvellePage;
	}

	/**
	 * Cette méthode cache l'entièreté des pages du site qui sont accessibles depuis le menu
	 */
	toutCacher () {
		for (const lien of document.querySelectorAll("nav > .menu a")) {
			const identifiant = lien.href.split("#/")[1].trim();

			// la page demandée par l'utilisateur est déjà en cours de chargement alors on l'ignore
			// et on se concentre sur les autres pages
			if (identifiant && identifiant !== this.pageActuelle) {
				this.cacherPage(identifiant);
			}
		}
	}
}

// on initialise notre site:
new Site();
