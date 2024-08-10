document
  .getElementById("jobSearchForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const jobBoards = Array.from(
      document.querySelectorAll("#jobBoards input[type=checkbox]:checked")
    ).map((checkbox) => checkbox.value);
    const location = document.getElementById("location").value || "Australia";
    const searchTerms =
      document.getElementById("searchTerms").value || "software developer";
    const timeRange = document.getElementById("timeRange").value;

    const query = buildQuery(jobBoards, location, searchTerms);
    const webQuery = buildWebQuery(query, timeRange);

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `<p>Your search URL:</p><a href="${webQuery}" target="_blank">${webQuery}</a>`;
  });

function siteQueryFor(jobBoard) {
  const siteQueries = {
    careerone: "site:careerone.com.au",
    linkedin: "site:linkedin.com",
    workforce: "site:workforce.com.au",
    ethical: "site:ethicaljobs.com.au",
    all: "site:careerone.com.au OR site:linkedin.com OR site:workforce.com.au OR site:ethicaljobs.com.au",
  };
  return siteQueries[jobBoard] || "";
}

function buildQuery(jobBoards, location, searchTerms) {
  const siteQuery = jobBoards.map(siteQueryFor).join(" OR ");
  const termString = searchTerms
    .split(",")
    .map((term) => `"${term.trim()}"`)
    .join(" ");

  return `${siteQuery} "${location}" ${termString} intext:"apply"`.trim();
}

function buildWebQuery(query, timeRange) {
  let url = `https://www.google.com.au/search?q=${encodeURIComponent(query)}`;
  if (timeRange) {
    url += `&${timeRange}`;
  }
  return url;
}

document.getElementById("saveFavorite").addEventListener("click", function () {
  const queryName = document.getElementById("queryName").value.trim();

  if (!queryName) {
    snack("Please enter a name for your query.");
    return;
  }

  const jobBoards = Array.from(
    document.querySelectorAll("#jobBoards input[type=checkbox]:checked")
  ).map((checkbox) => checkbox.value);
  const location = document.getElementById("location").value;
  const searchTerms = document.getElementById("searchTerms").value;
  const timeRange = document.getElementById("timeRange").value;

  const favorite = {
    name: queryName,
    jobBoards: jobBoards,
    location: location,
    searchTerms: searchTerms,
    timeRange: timeRange,
  };

  const favorites = getFavorites();
  favorites.push(favorite);
  setFavorites(favorites);

  populateFavoritesDropdown();
  snack("Search query saved as favorite!");
});

function getFavorites() {
  const favorites = document.cookie
    .split("; ")
    .find((row) => row.startsWith("favorites="));
  return favorites
    ? JSON.parse(decodeURIComponent(favorites.split("=")[1]))
    : [];
}

function setFavorites(favorites) {
  document.cookie = `favorites=${encodeURIComponent(
    JSON.stringify(favorites)
  )};path=/;max-age=31536000`;
}

document
  .getElementById("clearSelections")
  .addEventListener("click", function () {
    document
      .querySelectorAll('#jobSearchForm input[type="text"]')
      .forEach((input) => (input.value = ""));

    document
      .querySelectorAll('#jobSearchForm input[type="checkbox"]')
      .forEach((checkbox) => (checkbox.checked = false));

    document.getElementById("timeRange").selectedIndex = 0;

    document.getElementById("queryName").value = "";
  });

document
  .getElementById("clearFavorites")
  .addEventListener("click", function () {
    document.cookie = "favorites=; path=/; max-age=0";
    populateFavoritesDropdown();
    snack("All favorites have been cleared!");
  });

function populateFavoritesDropdown() {
  const favorites = getFavorites();
  const favoritesSelect = document.getElementById("favoritesSelect");

  favoritesSelect.innerHTML =
    '<option value="">-- Select a favorite --</option>';

  favorites.forEach((favorite, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = favorite.name || `Favorite ${index + 1}`;
    favoritesSelect.appendChild(option);
  });
}

document
  .getElementById("loadFavoriteBtn")
  .addEventListener("click", function () {
    const favoritesSelect = document.getElementById("favoritesSelect");
    const selectedIndex = favoritesSelect.value;

    if (selectedIndex !== "") {
      loadFavorite(selectedIndex);
    } else {
      snack("Please select a favorite to load.");
    }
  });

document.addEventListener("DOMContentLoaded", function () {
  populateFavoritesDropdown();
});

function loadFavorite(index) {
  const favorites = getFavorites();
  const favorite = favorites[index];

  if (favorite) {
    document
      .querySelectorAll("#jobBoards input[type=checkbox]")
      .forEach((checkbox) => {
        checkbox.checked = favorite.jobBoards.includes(checkbox.value);
      });
    document.getElementById("location").value = favorite.location;
    document.getElementById("searchTerms").value = favorite.searchTerms;
    document.getElementById("timeRange").value = favorite.timeRange;
    document.getElementById("queryName").value = favorite.name;

    snack("Favorite loaded!");
  } else {
    snack("Favorite not found.");
  }
}

function snack(message) {
  var x = document.getElementById("snack");
  x.textContent = message;
  x.className = "show";

  setTimeout(function () {
    x.className = x.className.replace("show", "");
  }, 3000);
}
