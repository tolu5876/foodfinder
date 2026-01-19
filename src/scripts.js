const API_KEY = "db399da28d2743c3ab5c988164b55177";

const input = document.getElementById("foodInput");
const loader = document.getElementById("loader");
const message = document.getElementById("message");
const recipeContainer = document.getElementById("recipeContainer");

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchFood();
});

async function searchFood() {
  const foodName = input.value.trim();
  recipeContainer.innerHTML = "";
  message.textContent = "";
  message.style.display = "none";

  if (!foodName) {
    message.textContent = "Please enter a food name.";
    message.style.display = "block";
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
      message.style.display = "block";
      return;
    }

    const recipe = searchData.results[0];

    // Step 2: Get detailed recipe info
    const detailsUrl = `https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${API_KEY}&includeNutrition=false`;
    const detailsRes = await fetch(detailsUrl);
    const detailsData = await detailsRes.json();

    // Step 3: Get ingredients
    const ingredientUrl = `https://api.spoonacular.com/recipes/${recipe.id}/ingredientWidget.json?apiKey=${API_KEY}`;
    const ingredientRes = await fetch(ingredientUrl);
    const ingredientData = await ingredientRes.json();

    if (!ingredientData.ingredients || ingredientData.ingredients.length === 0) {
      message.textContent = "No ingredients found.";
      message.style.display = "block";
      return;
    }

    // Create recipe result container
    const resultDiv = document.createElement("div");
    resultDiv.className = "recipe-result";

    // Create recipe header
    const recipeHeader = document.createElement("div");
    recipeHeader.className = "recipe-header";

    // Left side - Recipe image
    const imageContainer = document.createElement("div");
    imageContainer.className = "recipe-image-container";
    
    const recipeImg = document.createElement("img");
    recipeImg.src = recipe.image;
    recipeImg.alt = recipe.title;
    recipeImg.className = "recipe-image";
    
    const badge = document.createElement("div");
    badge.className = "recipe-badge";
    badge.textContent = "PROFESSIONAL";
    
    imageContainer.appendChild(recipeImg);
    imageContainer.appendChild(badge);

    // Right side - Recipe info
    const recipeInfo = document.createElement("div");
    
    const recipeTitle = document.createElement("h2");
    recipeTitle.className = "recipe-title";
    recipeTitle.textContent = recipe.title;
    
    // Create meta information
    const metaDiv = document.createElement("div");
    metaDiv.className = "recipe-meta";
    
    const readyTime = document.createElement("div");
    readyTime.className = "meta-item";
    readyTime.innerHTML = `
      <div class="meta-icon">⏱️</div>
      <div class="meta-label">Ready In</div>
      <div class="meta-value">${detailsData.readyInMinutes || 'N/A'} min</div>
    `;
    
    const servings = document.createElement("div");
    servings.className = "meta-item";
    servings.innerHTML = `
      <div class="meta-icon">👥</div>
      <div class="meta-label">Servings</div>
      <div class="meta-value">${detailsData.servings || 'N/A'}</div>
    `;
    
    const difficulty = document.createElement("div");
    difficulty.className = "meta-item";
    difficulty.innerHTML = `
      <div class="meta-icon">⚡</div>
      <div class="meta-label">Difficulty</div>
      <div class="meta-value">${detailsData.difficulty || 'Easy'}</div>
    `;

    metaDiv.appendChild(readyTime);
    metaDiv.appendChild(servings);
    metaDiv.appendChild(difficulty);
    
    recipeInfo.appendChild(recipeTitle);
    recipeInfo.appendChild(metaDiv);
    
    recipeHeader.appendChild(imageContainer);
    recipeHeader.appendChild(recipeInfo);

    // Create content grid
    const contentGrid = document.createElement("div");
    contentGrid.className = "content-grid";

    // Instructions section
    const instructionsSection = document.createElement("div");
    instructionsSection.className = "instructions-section";
    
    const instructionsHeader = document.createElement("div");
    instructionsHeader.className = "section-header";
    instructionsHeader.innerHTML = `
      <i class="fas fa-list-ol"></i>
      📝 Cooking Instructions
    `;
    
    const instructionsContent = document.createElement("div");
    instructionsContent.className = "section-content";
    
    if (detailsData.analyzedInstructions && detailsData.analyzedInstructions.length > 0) {
      const instructionsList = document.createElement("div");
      instructionsList.className = "instructions-list";
      
      detailsData.analyzedInstructions[0].steps.forEach((step, index) => {
        const stepDiv = document.createElement("div");
        stepDiv.className = "instruction-step";
        stepDiv.textContent = step.step || step;
        instructionsList.appendChild(stepDiv);
      });
      
      instructionsContent.appendChild(instructionsList);
    } else {
      instructionsContent.innerHTML = "<p>No detailed instructions available.</p>";
    }
    
    instructionsSection.appendChild(instructionsHeader);
    instructionsSection.appendChild(instructionsContent);

    // Ingredients section
    const ingredientsSection = document.createElement("div");
    ingredientsSection.className = "ingredients-section";
    
    const ingredientsHeader = document.createElement("div");
    ingredientsHeader.className = "section-header";
    ingredientsHeader.innerHTML = `
      <i class="fas fa-carrot"></i>
      🥬 Ingredients
    `;
    
    const ingredientsContent = document.createElement("div");
    ingredientsContent.className = "section-content";
    
    const ingredientsList = document.createElement("div");
    ingredientsList.className = "ingredients-list";
    
    ingredientData.ingredients.forEach((item) => {
      const ingredientItem = document.createElement("div");
      ingredientItem.className = "ingredient-item";
      
      const icon = document.createElement("div");
      icon.className = "ingredient-icon";
      icon.innerHTML = "<i class='fas fa-leaf'></i>";
      
      const details = document.createElement("div");
      details.className = "ingredient-details";
      
      const name = document.createElement("div");
      name.className = "ingredient-name";
      name.textContent = item.name;
      
      const amount = document.createElement("div");
      amount.className = "ingredient-amount";
      const metricAmount = item.amount?.metric;
      amount.textContent = metricAmount 
        ? `${metricAmount.value} ${metricAmount.unit}`
        : "To taste";
      
      details.appendChild(name);
      details.appendChild(amount);
      
      ingredientItem.appendChild(icon);
      ingredientItem.appendChild(details);
      ingredientsList.appendChild(ingredientItem);
    });
    
    ingredientsContent.appendChild(ingredientsList);
    ingredientsSection.appendChild(ingredientsHeader);
    ingredientsSection.appendChild(ingredientsContent);

    // Assemble everything
    contentGrid.appendChild(instructionsSection);
    contentGrid.appendChild(ingredientsSection);
    
    resultDiv.appendChild(recipeHeader);
    resultDiv.appendChild(contentGrid);
    
    recipeContainer.appendChild(resultDiv);

  } catch (err) {
    console.error(err);
    message.textContent = "Error fetching ingredients. Try again later.";
    message.style.display = "block";
  } finally {
    loader.style.display = "none";
  }
}
