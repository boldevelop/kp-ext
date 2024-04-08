const OP_NAME = {
    Favorites: 'Favorites',
    SelectionList: 'SelectionList',
    Selection: 'Selection',
};
window.TvSeries = {};

function TimeoutedFetch(url, options, timeout = 7000) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), timeout)
        )
    ]);
}

const constantMock = window.fetch;
window.fetch = function() {
    const urlString = arguments[0];
    const Url = new URL(urlString);
    
    if (Url.host !== 'graphql.kinopoisk.ru') {
        return constantMock.apply(this, arguments);
    }

    let onJson = null;
    switch (Url.searchParams.get('operationName')) {
        case OP_NAME.Favorites:
            onJson = processJsonFavorites;
            break;
        case OP_NAME.SelectionList:
            onJson = processJsonSelectionList;
            break;
        case OP_NAME.Selection:
            onJson = processJsonSelection;
            break;
    }


    if (!onJson) {
        return constantMock.apply(this, arguments);
    }

    return new Promise((resolve, reject) => {
        constantMock.apply(this, arguments)
            .then((response) => {
                if (response) {
                    return response
                        .clone()
                        .json()
                        .then((json) => {
                            onJson(json);
                            resolve(response);
                        })
                        .catch(() => reject(response))
                }
                return reject(response);
            })
            .catch((e) => reject(e))
    })
}

function processJsonFavorites(json) {
    try {
        const movies = json.data.watchLaterSelection.content.items;
        findTvSeries(movies);
    } catch (e) {
        console.error(e);
    }
}

function processJsonSelection(json) {
    try {
        const movies = json.data.selection.content.items;
        findTvSeries(movies);
    } catch (e) {
        console.error(e);
    }
}

function processJsonSelectionList(json) {
    try {
        const showCases = json.data.showcase.content.items;
        showCases.forEach((showCase) => {
            if (showCase.__typename !== 'Selection') {
                return;
            }

            const movies = showCase.content.items;
            findTvSeries(movies);
        });
    } catch (e) {
        console.error(e);
    }
}

function findTvSeries(movies) {
    movies.forEach((f) => {
        const movie = f.movie;

        if (movie.__typename !== 'Film') {
            window.TvSeries[movie.contentId] = {
                isTop: movie.top250 || movie.top10,
                isNoRating: Boolean(movie.rating.kinopoisk.value) === false,
            };
        }
    });
}

function isContainTvSeriesLabel(filmLinkNode) {
    return Array
        .from(filmLinkNode.parentNode.childNodes)
        .some(el => el.classList.contains('TvSeries'));
}

function getTvSeriesNode(opt) {
    const tvSeriesText = document.createTextNode("Сериал");
    const tvSeriesNode = document.createElement("div");
    tvSeriesNode.appendChild(tvSeriesText);
    tvSeriesNode.classList.add('TvSeries');
    if (opt.isTop) {
        tvSeriesNode.classList.add('TvSeries_TopRaited');
    }
    if (opt.isNoRating) {
        tvSeriesNode.classList.add('TvSeries_NoRating');
    }
    return tvSeriesNode
}

function main() {
    const observer = new MutationObserver(function(mutationsList, observer) {
        for(const mutation of mutationsList) {
            const node = mutation.addedNodes.item(0);
            if (node && node.classList.contains('TvSeries')) {
                continue;
            }
    
            Object
                .entries(window.TvSeries)
                .forEach(([contentId, opt]) => {
                    const filmLinkNodes = document.querySelectorAll(`a[href="/film/${contentId}"]`);
    
                    Array
                        .from(filmLinkNodes)
                        .forEach(filmLinkNode => {
                            if (filmLinkNode) {
                                if (!isContainTvSeriesLabel(filmLinkNode)) {
                                    filmLinkNode.parentNode.insertBefore(getTvSeriesNode(opt), filmLinkNode.nextSibling)
                                }
                            }
                        })
                })
        }
    });
    
    const targetNode = document.getElementById('app-container');
    if (targetNode) {
        observer.observe(targetNode, { childList: true, subtree: true });
    }
}

try {
    main();
} catch (e) {
    console.error(e)
}