const API_KEY = "db399da28d2743c3ab5c988164b55177";

async function searchFood() {
  const foodName = document.getElementById("foodInput").value;
  const list = document.getElementById("ingredientsList");
  list.innerHTML = "";

  if (!foodName) {
    list.innerHTML = "<li>Please enter a food name</li>";
    return;
  }

  try {
    // Step 1: Search recipes
    const searchUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${foodName}&apiKey=${API_KEY}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.results || searchData.results.length === 0) {
      list.innerHTML = "<li>No recipe found</li>";
      return;
    }

    const recipeId = searchData.results[0].id;

    // Step 2: Get ingredients for the first recipe
    const ingredientsUrl = `https://api.spoonacular.com/recipes/${recipeId}/ingredientWidget.json?apiKey=${API_KEY}`;
    const ingredientsResponse = await fetch(ingredientsUrl);
    const ingredientsData = await ingredientsResponse.json();

    if (!ingredientsData.ingredients || ingredientsData.ingredients.length === 0) {
      list.innerHTML = "<li>No ingredients found</li>";
      return;
    }

    ingredientsData.ingredients.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item.name + (item.amount ? ` - ${item.amount.metric.value} ${item.amount.metric.unit}` : "");
      list.appendChild(li);
    });

  } catch (error) {
    console.error(error);
    list.innerHTML = "<li>Error fetching data</li>";
  }
}
