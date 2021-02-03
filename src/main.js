import './styles/main.css';

document.addEventListener('DOMContentLoaded', function() {
    let searchData;
    let newsData;
    let apiKey = 'ddb966e2-c9aa-439a-9228-28bfeb7f309d';
    let lastArticlesDate = new Date();
    let phrase = document.getElementById('newsContentSearch').value;

    lastArticlesDate.setDate(lastArticlesDate.getDate() - 30);

    function formatDate(date) {
        let d = new Date(date),
            month = '' + (d.getMonth() + 1),
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

    function addToReadLater(value) {
        const readLaterData = localStorage.getItem('readLaterData');

        const data = {
            id: value.id,
            webUrl: value.webUrl,
            webTitle: value.webTitle,
        };

        if (readLaterData) {
            let localStorageValue = JSON.parse(readLaterData);
            const hasValue = localStorageValue.some(storageValue => storageValue.id === value.id);

            if (!hasValue) {
                localStorageValue.push(data);
                localStorage.setItem('readLaterData', JSON.stringify(localStorageValue));
                createToReadLaterSection();
            }
        } else {
            const localStorageValue = [data];
            localStorage.setItem('readLaterData', JSON.stringify(localStorageValue));
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

            for(let i = 1; i <= searchData.response.pages; i++ ) {
                const newOption = document.createElement('option');
                newOption.id = 'option' + i;
                newOption.value = i.toString();
                newOption.innerHTML = i.toString();
                document.getElementById('activePageSelect').appendChild(newOption);
            }

            document.getElementById('activePageSelect').addEventListener('change', function() {
                fetchDataByPage(document.getElementById('activePageSelect').value);
            });
        }
    }

    function createToReadLaterSection() {
        const readLaterData = JSON.parse(localStorage.getItem('readLaterData'));
        const newsTile = document.createDocumentFragment();

        document.getElementById('readLater').innerHTML = '';

        if(readLaterData) {
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
                document.getElementById(`${id}`).addEventListener('click', function() {
                    removeFromReadLater(readLaterData[i].id);
                });
            }
        }
    }

    function createNewsArticlesContent() {
        const newsTile = document.createDocumentFragment();
        document.getElementById('newsList').innerText = '';

        for(let i = 0; i < newsData.response.results.length; i++) {
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
        fetch('https://content.guardianapis.com/search?q=' + phrase + '&page=1&page-size=10&from-date=' + formatDate(lastArticlesDate) + '&' + 'section=' + section + '&api-key=' + apiKey, {
            method: 'GET'
        })
            .then(response => response.json())
            .then(data => {
                searchData = data;
                newsData = data;
                createNewsArticlesContent();
                preperSearchForm();
            });
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
