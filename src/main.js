import './styles/main.css'; // czemu import do css w js??? 
// wydzielić do osobnej metody to co się dzieje wewnątrz
document.addEventListener('DOMContentLoaded', function() { // () => 
    let searchData;
    let newsData;
    let apiKey = 'ddb966e2-c9aa-439a-9228-28bfeb7f309d';
    let lastArticlesDate = new Date();
    let phrase = document.getElementById('newsContentSearch').value; // newsContentSearch do stałej

    lastArticlesDate.setDate(lastArticlesDate.getDate() - 30); // 30 - magic number, co to oznacza
// osobna metoda poza 
    function formatDate(date) {
        let d = new Date(date),
            month = '' + (d.getMonth() + 1), // String(d.getMonth() + 1) chyba czytelniejsze
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join('-');
    }

    let sectionsAll = 'sport|culture|business|books';
    let section = sectionsAll;
// wynieść poza
    function addToReadLater(value) {
        const readLaterData = localStorage.getItem('readLaterData'); // readLaterData - jako globalny const

        const data = {
            id: value.id,
            webUrl: value.webUrl,
            webTitle: value.webTitle,
        };

        if (readLaterData) { // wynieść operacje w if i else do osobnych metod
            let localStorageValue = JSON.parse(readLaterData);
            const hasValue = localStorageValue.some(storageValue => storageValue.id === value.id);

            if (!hasValue) {
                localStorageValue.push(data);
                localStorage.setItem('readLaterData', JSON.stringify(localStorageValue));
                createToReadLaterSection();
            }
        } else {
            const localStorageValue = [data];
            localStorage.setItem('readLaterData', JSON.stringify(localStorageValue)); // można wynieść jakąś abstrakcje do odczytu i zapisu ls
            createToReadLaterSection();
        }
    }

    function removeFromReadLater(id) {
        const readLaterData = localStorage.getItem('readLaterData');
        let localStorageValue = JSON.parse(readLaterData);

        const newValue = localStorageValue.filter(element => {
            return element.id !== id;
        });

        localStorage.setItem('readLaterData', JSON.stringify(newValue));

        createToReadLaterSection();
    }

    function preperSearchForm() {
        document.getElementById('activePageSelect').innerHTML = '';
        if (searchData) {

            for(let i = 1; i <= searchData.response.pages; i++ ) { // formatowanie, czemu pętla od 1, pominie pierwszy element
                const newOption = document.createElement('option');
                newOption.id = 'option' + i;
                newOption.value = i.toString();
                newOption.innerHTML = i.toString();
                document.getElementById('activePageSelect').appendChild(newOption);
            }

            document.getElementById('activePageSelect').addEventListener('change', function() { // () => zamiast function 
                fetchDataByPage(document.getElementById('activePageSelect').value);
            });
        }
    }

    function createToReadLaterSection() {
        const readLaterData = JSON.parse(localStorage.getItem('readLaterData'));
        const newsTile = document.createDocumentFragment();

        document.getElementById('readLater').innerHTML = '';

        if(readLaterData) { // formatowanie tu i poniżej
            for(let i = 0; i < readLaterData.length; i++) {
                const newLi = document.createElement('li');
                const id = readLaterData[i].id;

                newLi.innerHTML = `<h4 class="readLaterItem-title">${readLaterData[i].webTitle}</h4>
                <section>
                  <a href="${readLaterData[i].webUrl}" class="button button-clear">Read</a>
                  <button class="button button-clear" id="${id}">Remove</button>
                </section>`;

                newsTile.appendChild(newLi);

                document.getElementById('readLater').appendChild(newsTile);
                document.getElementById(`${id}`).addEventListener('click', function() { // niepotrzebne `${id}`, samo id chyba też zadziała
                    removeFromReadLater(readLaterData[i].id);
                });
            }
        }
    }

    function createNewsArticlesContent() {
        const newsTile = document.createDocumentFragment();
        document.getElementById('newsList').innerText = '';

        for(let i = 0; i < newsData.response.results.length; i++) { // a jak nie będzie results ?
            const newLi = document.createElement('li');
            const id = 'news' + i;

            newLi.innerHTML = `<article class="news">
                  <header>
                    <h3>${newsData.response.results[i].webTitle}</h3>
                  </header>
                  <section class="newsDetails">
                    <ul>
                      <li><strong>Section Name: </strong>${newsData.response.results[i].sectionName}</li>
                      <li><strong>Publication Date: </strong>${formatDate(newsData.response.results[i].webPublicationDate)}</li>
                    </ul>
                  </section>
                  <section class="newsActions">
                    <a href="${newsData.response.results[i].webUrl}" class="button">Full article</a>
                    <button class="button button-outline" id="${id}">Read Later</button>
                  </section>
                </article>`;

            newsTile.appendChild(newLi);
            document.getElementById('newsList').appendChild(newsTile);
            document.getElementById(`${id}`).addEventListener('click', function() {
                addToReadLater(newsData.response.results[i]);
            });
        }
    }

    function fetchData() {
        // url do osobnego consta z `${}`
        // wynióslbym sam request do osobnej funkcji async i potem ją wywołał - przykład poniżej
        // https://github.com/Kamilnaja/Pomodoro-Timer/blob/d1b40e15f9f3b397ad418a3d5a7d916d258bf71a/web/src/stats/store/actions/stats.actions.ts#L41
        fetch('https://content.guardianapis.com/search?q=' + phrase + '&page=1&page-size=10&from-date=' + formatDate(lastArticlesDate) + '&' + 'section=' + section + '&api-key=' + apiKey, {
            method: 'GET'
        }) // nie obsługujemy błędu, trzeba sprawdzić czy response.ok i dopiero potem parsować jsona
            .then(response => response.json())
            .then(data => {
                searchData = data;
                newsData = data;
                createNewsArticlesContent();
                preperSearchForm();
            });
        
        // .catch((e) => )
        
    }

    function changeSection(selectedSection) {
        if (selectedSection === 'all') {
            section = sectionsAll;
        } else {
            section = selectedSection;
        }

        fetchData();
    }

    function fetchDataByPage(pageNumber) {
        // url w `` i ${}
        fetch('https://content.guardianapis.com/search?q=' + phrase + '&page=' + pageNumber + '&page-size=10&from-date=' + formatDate(lastArticlesDate) + '&' + 'section=' + section + '&api-key=' + apiKey, {
            method: 'GET'
        })
            .then(response => response.json())
            .then(data => {
                searchData = data;
                newsData = data;
                createNewsArticlesContent();
            });
    }

    function fetchInitialData() {
        fetch('https://content.guardianapis.com/search?page=1&page-size=10&from-date=' + formatDate(lastArticlesDate) + '&' + 'section=' + sectionsAll + '&api-key=' + apiKey, {
            method: 'GET'
        })
            .then(response => response.json())
            .then(data => {
                searchData = data;
                newsData = data;
                preperSearchForm();
                createNewsArticlesContent();
                createToReadLaterSection();
            });
    }

    document.getElementById('sectionSelect').addEventListener('change', function() {
        phrase = document.getElementById('newsContentSearch').value;
        changeSection(document.getElementById('sectionSelect').value);
    });

    document.getElementById('newsContentSearch').addEventListener('change', function() {
        phrase = document.getElementById('newsContentSearch').value;
        fetchData(document.getElementById('newsContentSearch').value);
    });

    fetchInitialData();
});
