import api, { route } from '@forge/api';

export async function issueCreatedHandler (event, context) {
  console.log('Issue created event:', event.issue.key, 'project:', event.issue.fields.project.key);

  // Exemple d'action automatique : ajouter un label "NewTask" si absent
  const labels = event.issue.fields.labels || [];
  if (!labels.includes('NewTask')) {
    await api.asApp().requestJira(
      route`/rest/api/3/issue/${event.issue.key}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { labels: [...labels, 'NewTask'] } })
      }
    );
    console.log('Label ajouté à la demande');
  }
  return true;
}
