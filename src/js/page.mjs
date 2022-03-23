/**
 * @file Ce module permet d'analyser des pages HTML
 * @author Pascal Breton Beauchamp
 * @license 0BSD
 */

/** une copie de la feuille de style principale du site */
const stylePrincipal = document.querySelector('link[href^="css/"]');

/** l'analyseur de fichier HTML qu'on utilise pour lire les pages du site */
const domParser = new DOMParser();



/** représente une page du `Site` */
export default class Page {
	/**
	 * identifiant de la page
	 * @type {IdentifiantPage}
	 */
	identifiant;

	/**
	 * le corps de la page
	 * @type {DocumentFragment}
	 */
	corps;

	/**
	 * meta-description de la page
	 * @type {String}
	 */
	description = "";

	/**
	 * titre de la page
	 * @type {String}
	 */
	titre;

	/**
	 * référence à la classe parent `Site`
	 * @type {Site}
	 */
	#site;

	/**
	 * Crée une nouvelle `Page`
	 * @param {Site} site référence au parent
	 * @param {Object} page les données de la nouvelle page
	 */
	constructor (site, page) {
		this.#site = site;
		Object.assign(this, page);
	}

	/**
	 * Analyse la source HTLM d'une page et retourne `Page`
	 * @param {Site} site référence au `Site` parent
	 * @param {IdentifiantPage} identifiant la page demandée
	 * @param {String} source la source HTML de la page demandée
	 * @returns {Page} la page résultante
	 */
	static depuis (site, identifiant, source) {
		// on convertit en `Document`:
		const html = domParser.parseFromString(source, "text/html");

		// on obtient les balises de la page:
		const titre = html.querySelector("h1").innerText.trim();
		const description = html.querySelector("meta-description")?.innerText.trim();
		const corps = html.querySelector("template").content;
		const styleDePage = html.querySelectorAll("style");
		const scriptDePage = html.querySelectorAll("script");

		/*
			Le corps de la page est contenu dans un ShadowRoot. Or, le contenu d'un ShadowRoot
			n'hérite pas des feuilles de style qui s'appliquent à son parent. Il faut donc
			manuellement importer la feuille de style principale en ajoutant sa balise <link>
			au début du ShadowRoot. Cela n'occasionnera pas une nouvelle requête réseau puisque
			le navigateur a déjà analysé et interprété cette feuille de style.
		*/
		corps.prepend(stylePrincipal.cloneNode());

		// si la page comporte un style CSS spécifique, on vient l'intégrer au ShadowRoot:
		if (styleDePage) {
			corps.prepend(...styleDePage);
		}

		// si la page comporte un script spécifique, on vient l'intégrer au ShadowRoot:
		if (scriptDePage) {
			corps.append(...scriptDePage);
		}

		return new this(site, { titre, corps, identifiant, description });
	}

	/**
	 * Change l'état du `Site` pour réfléter le contenu de cette `Page`
	 */
	activer () {
		// on vient remplacer les éléments actuels par nos nouveaux éléments:
		this.#site.titreDePage = this.titre; // le nouveau bandeau de titre de la page
		this.#site.description = this.description; // la nouvelle description [SEO]
		this.#site.contenuPrincipal = this.corps.cloneNode(true).childNodes; // le nouveau contenu de la page
		this.#site.pageMenuActive = this.identifiant; // on change la page active dans le menu
	}
}
