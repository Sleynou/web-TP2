/**
 * @file Le site fait des requêtes en fetch(), ce qui n'est pas permis par les
 *       navigateurs lorsqu'on tente d'ouvrir index.html. Il faut donc absolument
 *       servir ce site avec un vrai serveur HTTP.
 * @author Pascal Breton Beauchamp
 * @license 0BSD
 */

"use strict";

(async () => {
	try {
		// on charge un fichier qui devrait toujours être présent:
		await fetch("favicon.ico");
	} catch (exception) {
		// si ça échoue, on assume ne pas pouvoir émettre de requêtes fetch():
		const titre = document.querySelector("main header h1");
		const message = document.querySelector("main .corps");

		titre.innerText = "Serveur HTTP requis";
		message.innerHTML = `
			<section>
				<h2>Impossible de continuer</h2>
				<p>Ce site requiert un serveur HTTP pour fonctionner correctement.</p>
				<p>Merci d'utiliser l'extension VSCode <em>Live Preview</em>, <em>Live Server</em> ou tout autre serveur de contenu statique.</p>
			</section>
			<section>
				<h2>Explication</h2>
				<p>
					Ce site effectue des requêtes en <code>fetch()</code>, ce qui n'est pas permis par un navigateur lorsqu'on ouvre directement le fichier index.html.
				</p>
				<p>
					Il faut donc absolument que ce site soit servi par un vrai serveur HTTP pour fonctionner normalement.
				</p>
				<p>
					Merci pour votre compréhension!
				</p>
			</section>`;

		// on désactive l'intéractivité:
		document.body.style.pointerEvents = "none";

		// on grise les liens:
		for (const lien of document.querySelectorAll("nav a, footer a")) {
			lien.style.opacity = .3;
		}
	}
})();
