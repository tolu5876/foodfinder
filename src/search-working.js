const API_KEY = "db399da28d2743c3ab5c988164b55177";

const input = document.getElementById("foodInput");
const loader = document.getElementById("loader");
const emptyState = document.getElementById("emptyState");
const resultsCount = document.getElementById("resultsCount");

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchFood();
});

async function searchFood() {
  const foodName = input.value.trim();
  
  // Clear previous results
  document.getElementById("ingredientsList").innerHTML = "";
  document.getElementById("recipeContainer").innerHTML = "";
  document.getElementById("instructionsContainer").innerHTML = "";
  
  emptyState.style.display = "block";
  resultsCount.style.display = "none";

  if (!foodName) {
    emptyState.innerHTML = `
      <div class="empty-icon">
        <i class="fas fa-exclamation-circle"></i>
      </div>
      <div class="empty-title">Please enter a food name</div>
      <div class="empty-text">
        Type something like "pizza", "burger", or "salad" to search 🍽️
      </div>
    `;
    return;
  }

  loader.style.display = "block";
  emptyState.style.display = "none";

  try {
    // Search recipes
    const searchUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(foodName)}&number=1&apiKey=${API_KEY}&addRecipeInformation=true&addRecipeInstructions=true&addRecipeNutrition=true`;
    
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.results || searchData.results.length === 0) {
      emptyState.style.display = "block";
      emptyState.innerHTML = `
        <div class="empty-icon">
          <i class="fas fa-search"></i>
        </div>
        <div class="empty-title">No recipes found</div>
        <div class="empty-text">
          Try searching for something else like "pasta", "chicken", or "soup" 🍽️
        </div>
      `;
      return;
    }

    const recipe = searchData.results[0];

    // Display recipe info
    const recipeContainer = document.getElementById("recipeContainer");
    recipeContainer.innerHTML = `
      <div style="background: linear-gradient(135deg, #f8fafc, #e2e8f0); padding: 25px; border-radius: 16px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); display: flex; gap: 25px; align-items: flex-start;">
        <div style="flex-shrink: 0; width: 280px;">
          <img src="${recipe.image}" alt="${recipe.title}" style="width: 100%; border-radius: 12px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);">
        </div>
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <h3 style="font-size: 1.5rem; color: var(--primary); font-weight: 700; margin-bottom: 20px; line-height: 1.2;">${recipe.title}</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 8px; background: white; padding: 8px 16px; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <i class="fas fa-clock" style="color: var(--primary);"></i>
              <span style="font-weight: 600; color: var(--text);">Prep: ${recipe.prepMinutes || recipe.readyInMinutes || 30} min</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; background: white; padding: 8px 16px; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <i class="fas fa-fire" style="color: var(--accent);"></i>
              <span style="font-weight: 600; color: var(--text);">Cook: ${recipe.cookingMinutes || recipe.readyInMinutes || 45} min</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; background: white; padding: 8px 16px; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <i class="fas fa-users" style="color: var(--secondary);"></i>
              <span style="font-weight: 600; color: var(--text);">Servings: ${recipe.servings || 4}</span>
            </div>
          </div>
          <p style="color: var(--muted); font-size: 0.95rem; line-height: 1.5; margin-top: 15px;">${recipe.summary ? recipe.summary.replace(/<[^>]*>/g, '').substring(0, 150) + "..." : "A delicious recipe with fresh ingredients and amazing flavors."}</p>
        </div>
      </div>
    `;

    // Get ingredients
    const ingredientUrl = `https://api.spoonacular.com/recipes/${recipe.id}/ingredientWidget.json?apiKey=${API_KEY}`;
    const ingredientRes = await fetch(ingredientUrl);
    const ingredientData = await ingredientRes.json();

    if (ingredientData.ingredients && ingredientData.ingredients.length > 0) {
      resultsCount.textContent = ingredientData.ingredients.length;
      resultsCount.style.display = "inline-block";

      const ingredientsList = document.getElementById("ingredientsList");
      ingredientsList.innerHTML = "";

      ingredientData.ingredients.forEach((item, index) => {
        const amount = item.amount?.metric;
        const ingredientText = amount
          ? `${item.name} — ${amount.value} ${amount.unit}`
          : item.name;
        
        const li = document.createElement("li");
        li.className = "ingredient-item";
        li.style.animationDelay = `${index * 0.1}s`;
        li.innerHTML = `
          <div class="ingredient-icon">
            <i class="fas fa-leaf"></i>
          </div>
          <div class="ingredient-text">${ingredientText}</div>
        `;
        ingredientsList.appendChild(li);
      });
    }

    // Get instructions
    if (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0) {
      const instructions = recipe.analyzedInstructions[0].steps;
      
      const instructionsContainer = document.getElementById("instructionsContainer");
      instructionsContainer.innerHTML = `
        <div style="background: linear-gradient(135deg, #f0fff4, #e6fffa); padding: 25px; border-radius: 16px; border: 1px solid #c6f6d5; margin-top: 20px;">
          <h3 style="font-size: 1.3rem; color: var(--text); margin-bottom: 20px; font-weight: 600; text-align: center;">
            <i class="fas fa-list-ol" style="color: var(--secondary); margin-right: 10px;"></i>
            Cooking Instructions
          </h3>
          <ol style="padding: 0; margin: 0; list-style: none;">
            ${instructions.map((step, index) => `
              <li style="display: flex; align-items: flex-start; margin-bottom: 15px; padding: 15px; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); animation: fadeInUp 0.4s ease ${index * 0.1}s both;">
                <div style="width: 28px; height: 28px; background: var(--secondary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; margin-right: 15px; flex-shrink: 0;">${index + 1}</div>
                <div style="flex: 1; color: var(--text); line-height: 1.5;">${step.step}</div>
              </li>
            `).join('')}
          </ol>
        </div>
      `;
    }

  } catch (err) {
    console.error('Search error:', err);
    emptyState.style.display = "block";
    emptyState.innerHTML = `
      <div class="empty-icon">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <div class="empty-title">Something went wrong</div>
      <div class="empty-text">
        Error fetching recipe information. Please check your connection and try again 🍽️
      </div>
    `;
  } finally {
    loader.style.display = "none";
  }
}
