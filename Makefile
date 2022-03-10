.DEFAULT: test
.PHONY: test html validateur-html css stylelint hint lighthouse serve icones png favicon

test: html css #hint

html: validateur-html

validateur-html:
	@echo "Validation du balisage HTML..."
	npx -yq html-validate src

css: stylelint

stylelint:
#	sudo npm install -g stylelint-config-standard
	@echo "Validation des feuilles de style CSS..."
	npx -yq stylelint src/css/*.css
#	À RECTIFIER: on doit pouvoir analyser le CSS des sous-pages aussi!

serve:
#	on commence par essayer de libérer le port s'il est occupé:
	-@killall -q serve &>/dev/null
	-@pkill serve &>/dev/null
	@echo "Démarrage du serveur statique..."
	@(npx -yq serve -- -l 8888 src &)
	@while ! timeout 1 sh -c "echo >/dev/tcp/localhost/8888" 2>/dev/null; do sleep 1s; done
	@echo "Serveur statique prêt sur le port 8888"
	@sleep 2s

hint: serve
	@echo "Démarrage du test Webhint..."
	npx -yq hint -- http://localhost:8888
	@echo "Arrêt du serveur statique...";
	@pkill serve

lighthouse: serve
	@echo "Démarrage du test Lighthouse..."
	@mkdir -p lighthouse
	npx -yq lighthouse -- http://localhost:8888 --output html --output-path lighthouse/rapport.html
	@echo "Arrêt du serveur statique...";
	@pkill serve

icones: png favicon

png:
	@echo "Création des images PNG à partir du logo SVG..."
	npx -yq svgexport src/images/logo.svg src/images/logo256.png 100% 256:
	npx -yq svgexport src/images/logo.svg src/images/logo64.png 100% 64:
	npx -yq svgexport src/images/logo.svg src/images/logo32.png 100% 32:
	npx -yq svgexport src/images/logo.svg src/images/logo16.png 100% 16:
	@echo "Compression des images PNG..."
	npx -yq @squoosh/cli src/images/logo256.png --oxipng auto --output-dir src/images
	npx -yq @squoosh/cli src/images/logo64.png --oxipng auto --output-dir src/images
	npx -yq @squoosh/cli src/images/logo32.png --oxipng auto --output-dir src/images
	npx -yq @squoosh/cli src/images/logo16.png --oxipng auto --output-dir src/images

favicon:
	@echo "Création du favicon.ico..."
	convert src/images/logo16.png src/images/logo32.png src/images/logo64.png -colors 256 src/favicon.ico
