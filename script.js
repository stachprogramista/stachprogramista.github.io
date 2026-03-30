const page = document.head.querySelector('meta[name~="page"]').content
console.log(page)
function personal_projects_page_script() {
    const username = 'stachprogramista'

    const main = document.querySelector('main');

    fetch(`https://api.github.com/users/${username}/repos`)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            data.forEach(project => {
                let projectHTML = `<div>
        <p>${project.name}</p>
        <a href="${project.html_url}" target="_blank" class="external_link">View</a>
        <br>
      </div>`;
                main.innerHTML += projectHTML;
            });
        })
        .catch(error => console.error(error));
}
function contributions_page_script() {
    const username = 'stachprogramista'
    const main = document.querySelector('main');

    async function getPublicContributions(username) {
        const repos = [];
        let page = 1;
        while (true) {
            const res = await fetch(`https://api.github.com/search/issues?q=is:pr+author:${username}+is:merged&type=pr&page=${page}&per_page=100`);
            const data = await res.json();
            if (!data.items.length) break;
            for (const item of data.items) {
                const repo = item.repository_url.split('/repos/')[1];
                if (!repos.includes(repo)) repos.push(repo);
            }
            page++;
        }
        return repos;
    }

    const loadContributions = async (username) => {
  try {
    const contributions = await getPublicContributions(username);
    
    if (contributions.length === 0) {
      main.innerHTML += "<div><p>Nothing here <b>yet</b></p></div>";
    } else {
      contributions.forEach(project => {
        const projectHTML = `<div>
          <p>${project.name || project}</p>
          <a href="${project.html_url || `https://github.com/${project}`}" target="_blank" class="external_link">View</a>
        </div>`;
        main.innerHTML += projectHTML;
      });
    }
  } catch (error) {
    console.error('Error:', error);
    main.innerHTML += "<div>Error loading contributions</div>";
  }
};

loadContributions(username);

}
const nav = document.querySelector('nav');
nav.addEventListener('click', function (e){
  const documentWidth = window.innerWidth;
  if (documentWidth <= 798){
    if (!nav.classList.contains('open_nav')){
      e.preventDefault();
      nav.classList.toggle('open_nav');
      
    }
  }
})
switch (page) {
    case 'personal_projects':
        personal_projects_page_script();
        break;
    case 'contributions':
        contributions_page_script()
        break;
}
