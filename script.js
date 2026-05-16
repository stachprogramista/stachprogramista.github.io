const page = document.head.querySelector('meta[name~="page"]').content
console.log(page)
const username = 'stachprogramista'
const main = document.querySelector('main');
function isRateLimitReached(response) {
  const limit      = response.headers.get('X-RateLimit-Limit');
  const remaining  = response.headers.get('X-RateLimit-Remaining');
  const reset      = response.headers.get('X-RateLimit-Reset');

  const status = response.status;
  let data;

  try {
    data = JSON.parse(text);
  } catch (e) {
    data = {};
  }
  const message = data?.message || '';

  const isOverloaded =
    status === 403 ||
    status === 429 ||
    (limit && remaining && Number(remaining) <= 0) ||
    message.includes('rate limit');

  if (isOverloaded) {
    main.innerHTML +=
      `<div class="api-limit-warning">
        <p>GitHub API is rate‑limited.</p>
        ${reset
          ? `<small>Try again after ${new Date(reset * 1000).toLocaleTimeString()}.</small>`
          : ''}
      </div>`;
  }

  return isOverloaded;
}
// Pomocnicza funkcja do pobierania Top 3 języków i generowania HTML
async function getLanguagesHTML(languagesUrl) {
    try {
        const res = await fetch(languagesUrl);
        const langs = await res.json();
        const sortedLangs = Object.keys(langs).sort((a, b) => langs[b] - langs[a]).slice(0, 3);
        
        if (sortedLangs.length === 0) return '<div style="width:7.5em"></div>';

        const getVectorLogoUrl = (lang) => {
            // Mapowanie nazw GitHub na slugi Vector Logo Zone
            const mapping = {
                'javascript': 'javascript/javascript-icon',
                'typescript': 'typescriptlang/typescriptlang-icon',
                'python': 'python/python-icon',
                'html': 'w3_html5/w3_html5-icon',
                'css': 'w3_css/w3_css-icon',
                'c++': 'cpp/cpp-icon',
                'c#': 'csharp/csharp-icon',
                'java': 'java/java-icon',
                'php': 'php/php-icon',
                'ruby': 'ruby-lang/ruby-lang-icon'
            };

            const slug = mapping[lang.toLowerCase()] || `${lang.toLowerCase()}/${lang.toLowerCase()}-icon`;
            return `https://www.vectorlogo.zone/logos/${slug}.svg`;
        };

        return `
            <div class="languages-container">
                <img src="${getVectorLogoUrl(sortedLangs[0])}" class="main-lang" 
                     onerror="this.style.display='none'" alt="${sortedLangs[0]}">
                <div class="secondary-langs">
                    ${sortedLangs[1] ? `<img src="${getVectorLogoUrl(sortedLangs[1])}" class="sub-lang" onerror="this.style.display='none'">` : ''}
                    ${sortedLangs[2] ? `<img src="${getVectorLogoUrl(sortedLangs[2])}" class="sub-lang" onerror="this.style.display='none'">` : ''}
                </div>
            </div>`;
    } catch (e) {
        return '';
    }
}
async function personal_projects_page_script() {
  
    const response = await fetch(`https://api.github.com/users/${username}/repos`);
    if (isRateLimitReached(response)) return;
    const repos = await response.json();
    for (const project of repos) {
        const langHTML = await getLanguagesHTML(project.languages_url);
        const projectHTML = `
            <div class="project-card">
                ${langHTML}
                <div>
                    <h3><a href="${project.html_url}" target="_blank" class="external_link">${project.name}</a></h3>
                    <p>${project.description || ''}</p>
                </div>
            </div>`;
        main.innerHTML += projectHTML;
    }
}

async function contributions_page_script() {
    async function getPublicContributions(username) {
        const repos = [];
        let page = 1;
        while (true) {
            const res = await fetch(`https://api.github.com/search/issues?q=is:pr+author:${username}+is:merged&type=pr&page=${page}&per_page=100`);
            const data = await res.json();
            if (!data.items || !data.items.length) break;
            for (const item of data.items) {
                const repoUrl = item.repository_url;
                if (!repos.some(r => r.url === repoUrl)) {
                    repos.push({
                        url: repoUrl,
                        name: repoUrl.split('/repos/')[1],
                        langs_url: `${repoUrl}/languages`
                    });
                }
            }
            page++;
        }
        return repos;
    }
    //if (isRateLimitReached(response)) return;
    try {
        const contributions = await getPublicContributions(username);
        if (contributions.length === 0) {
            main.innerHTML += "<div><p>Nothing here <b>yet</b></p></div>";
        } else {
            for (const project of contributions) {
                const langHTML = await getLanguagesHTML(project.langs_url);
                const projectHTML = `
                    <div class="project-card">
                        ${langHTML}
                        <div>
                    <h3><a href="${project.html_url}" target="_blank" class="external_link">${project.name}</a></h3>
                    <p>${project.description || ''}</p>
                </div>
                    </div>`;
                main.innerHTML += projectHTML;
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
const nav = document.querySelector('nav');
nav.addEventListener('click', function (e){
  const documentWidth = window.innerWidth;
  if (documentWidth <= 767){
    if (!nav.classList.contains('open_nav')){
      e.preventDefault();
      nav.classList.toggle('open_nav');
    }
  }
  
})
window.addEventListener('DOMContentLoaded', function (e){
  console.log(window.innerWidth)
  window.dispatchEvent(new Event('resize'));
})
switch (page) {
    case 'personal_projects':
        personal_projects_page_script();
        break;
    case 'contributions':
        contributions_page_script()
        break;
}
