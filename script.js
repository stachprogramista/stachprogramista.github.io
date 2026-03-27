const page = document.head.querySelector('meta[name~="page"]').content
console.log(page)
function personal_projects_page_script() {
    const username = 'stachprogramista'

    const main = document.querySelector('main');

    fetch(`https://api.github.com/users/${username}/repos`)
        .then(response => response.json())
        .then(data => {
            data.forEach(project => {
                let projectHTML = `<div>
        <p>${project.name}</p>
        <a href="${project.html_url}" target="_blank">View</a>
        <br>
      </div>`;
                main.innerHTML += projectHTML;
            });
        })
        .catch(error => console.error(error));
}
switch (page) {
    case 'personal_projects':
        personal_projects_page_script()
}