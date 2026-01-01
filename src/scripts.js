const API_KEY = "db399da28d2743c3ab5c988164b55177";

const input = document.getElementById("foodInput");
const list = document.getElementById("ingredientsList");
const loader = document.getElementById("loader");
const message = document.getElementById("message");

// Create container for recipe name & image
let recipeContainer = document.createElement("div");
recipeContainer.id = "recipeContainer";
recipeContainer.style.textAlign = "center";
recipeContainer.style.marginBottom = "15px";
document.querySelector(".ingredient-ui").insertBefore(recipeContainer, list);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchFood();
});

async function searchFood() {
  const foodName = input.value.trim();
  list.innerHTML = "";
  recipeContainer.innerHTML = "";
  message.textContent = "";

  if (!foodName) {
    message.textContent = "Please enter a food name.";
    return;
  }

  loader.style.display = "block";

  try {
    // Step 1: Search recipes
    const searchUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(
      foodName
    )}&number=1&apiKey=${API_KEY}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.results || searchData.results.length === 0) {
      message.textContent = "No recipe found 😕";
      return;
    }

    const recipe = searchData.results[0];

    // Show recipe image & name
    const img = document.createElement("img");
    img.src = recipe.image;
    img.alt = recipe.title;
    img.style.width = "100%";
    img.style.borderRadius = "12px";
    img.style.marginBottom = "10px";

    const title = document.createElement("h3");
    title.textContent = recipe.title;
    title.style.marginBottom = "10px";
    title.style.fontSize = "1.3rem";
    title.style.color = "var(--primary)";

    recipeContainer.appendChild(img);
    recipeContainer.appendChild(title);

    // Step 2: Get ingredients
    const ingredientUrl = `https://api.spoonacular.com/recipes/${recipe.id}/ingredientWidget.json?apiKey=${API_KEY}`;
    const ingredientRes = await fetch(ingredientUrl);
    const ingredientData = await ingredientRes.json();

    if (!ingredientData.ingredients || ingredientData.ingredients.length === 0) {
      message.textContent = "No ingredients found.";
      return;
    }

    ingredientData.ingredients.forEach((item) => {
      const li = document.createElement("li");
      const amount = item.amount?.metric;
      li.textContent = amount
        ? `${item.name} — ${amount.value} ${amount.unit}`
        : item.name;
      list.appendChild(li);
    });

  } catch (err) {
    console.error(err);
    message.textContent = "Error fetching ingredients. Try again later.";
  } finally {
    loader.style.display = "none";
  }
}
