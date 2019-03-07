# EPSI ICS Calendar

Pour installer le projet, il suffit de télécharger le repository et d'installer les dépendances avec la commande `npm install`.

Par défaut l'application écoute le port `4000`, vous pouvez modifier ça dans le fichier `server.js`.

Vous pouvez spécifier les variables d'environnement suivantes :

- `login` : le login par défaut si aucun login n'est spécifié dans la requête.
- `serverId` : l'id du serveur distant **wigorservices.net**. Il peut également être spécifié dans la requête.

Une fois le projet configuré et démarré, vous pouvez accéder à votre flux ics via une url du type http://localhost:4000/agenda?login=prenom.nom