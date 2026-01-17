const API_KEY = "db399da28d2743c3ab5c988164b55177";

const input = document.getElementById("foodInput");
const list = document.getElementById("ingredientsList");
const loader = document.getElementById("loader");
const emptyState = document.getElementById("emptyState");
const resultsCount = document.getElementById("resultsCount");

// Create container for recipe info
let recipeContainer = document.createElement("div");
recipeContainer.id = "recipeContainer";
recipeContainer.style.textAlign = "center";
recipeContainer.style.marginBottom = "20px";
recipeContainer.style.display = "none";
document.querySelector(".results-section").insertBefore(recipeContainer, list);

// Create container for instructions
let instructionsContainer = document.createElement("div");
instructionsContainer.id = "instructionsContainer";
instructionsContainer.style.marginTop = "20px";
instructionsContainer.style.display = "none";
document.querySelector(".results-section").appendChild(instructionsContainer);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchFood();
});

async function searchFood() {
  const foodName = input.value.trim();
  list.innerHTML = "";
  recipeContainer.innerHTML = "";
  instructionsContainer.innerHTML = "";
  recipeContainer.style.display = "none";
  instructionsContainer.style.display = "none";
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
    // Step 1: Search recipes
    const searchUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(
      foodName
    )}&number=1&apiKey=${API_KEY}&addRecipeInformation=true&addRecipeInstructions=true&addRecipeNutrition=true`;
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

    // Show recipe image & name with time info in side-by-side layout
    const recipeInfo = document.createElement("div");
    recipeInfo.style.background = "linear-gradient(135deg, #f8fafc, #e2e8f0)";
    recipeInfo.style.padding = "25px";
    recipeInfo.style.borderRadius = "16px";
    recipeInfo.style.marginBottom = "20px";
    recipeInfo.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.05)";
    recipeInfo.style.display = "flex";
    recipeInfo.style.gap = "25px";
    recipeInfo.style.alignItems = "flex-start";

    // Left side - Image
    const imageContainer = document.createElement("div");
    imageContainer.style.flexShrink = "0";
    imageContainer.style.width = "280px";
    
    const img = document.createElement("img");
    img.src = recipe.image;
    img.alt = recipe.title;
    img.style.width = "100%";
    img.style.borderRadius = "12px";
    img.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.15)";
    
    imageContainer.appendChild(img);

    // Right side - Information
    const infoContainer = document.createElement("div");
    infoContainer.style.flex = "1";
    infoContainer.style.display = "flex";
    infoContainer.style.flexDirection = "column";
    infoContainer.style.justifyContent = "space-between";

    const title = document.createElement("h3");
    title.textContent = recipe.title;
    title.style.fontSize = "1.5rem";
    title.style.color = "var(--primary)";
    title.style.fontWeight = "700";
    title.style.marginBottom = "20px";
    title.style.lineHeight = "1.2";

    // Time and servings info
    const timeInfo = document.createElement("div");
    timeInfo.style.display = "flex";
    timeInfo.style.flexWrap = "wrap";
    timeInfo.style.gap = "12px";
    timeInfo.style.marginBottom = "10px";

    const prepTime = document.createElement("div");
    prepTime.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; background: white; padding: 8px 16px; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <i class="fas fa-clock" style="color: var(--primary);"></i>
        <span style="font-weight: 600; color: var(--text);">Prep: ${recipe.prepMinutes || recipe.readyInMinutes || 30} min</span>
      </div>
    `;

    const cookTime = document.createElement("div");
    cookTime.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; background: white; padding: 8px 16px; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <i class="fas fa-fire" style="color: var(--accent);"></i>
        <span style="font-weight: 600; color: var(--text);">Cook: ${recipe.cookingMinutes || recipe.readyInMinutes || 45} min</span>
      </div>
    `;

    const servings = document.createElement("div");
    servings.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; background: white; padding: 8px 16px; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <i class="fas fa-users" style="color: var(--secondary);"></i>
        <span style="font-weight: 600; color: var(--text);">Servings: ${recipe.servings || 4}</span>
      </div>
    `;

    const difficulty = document.createElement("div");
    const difficultyLevel = recipe.readyInMinutes < 30 ? "Easy" : recipe.readyInMinutes < 60 ? "Medium" : "Hard";
    const difficultyColor = difficultyLevel === "Easy" ? "var(--secondary)" : difficultyLevel === "Medium" ? "var(--accent)" : "#e53e3e";
    difficulty.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; background: white; padding: 8px 16px; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <i class="fas fa-signal" style="color: ${difficultyColor};"></i>
        <span style="font-weight: 600; color: var(--text);">${difficultyLevel}</span>
      </div>
    `;

    // Description if available
    const description = document.createElement("p");
    description.style.color = "var(--muted)";
    description.style.fontSize = "0.95rem";
    description.style.lineHeight = "1.5";
    description.style.marginTop = "15px";
    description.textContent = recipe.summary ? recipe.summary.replace(/<[^>]*>/g, '').substring(0, 150) + "..." : "A delicious recipe with fresh ingredients and amazing flavors.";

    timeInfo.appendChild(prepTime);
    timeInfo.appendChild(cookTime);
    timeInfo.appendChild(servings);
    timeInfo.appendChild(difficulty);

    infoContainer.appendChild(title);
    infoContainer.appendChild(timeInfo);
    infoContainer.appendChild(description);

    recipeInfo.appendChild(imageContainer);
    recipeInfo.appendChild(infoContainer);
    recipeContainer.appendChild(recipeInfo);
    recipeContainer.style.display = "block";

    // Step 2: Get ingredients
    const ingredientUrl = `https://api.spoonacular.com/recipes/${recipe.id}/ingredientWidget.json?apiKey=${API_KEY}`;
    const ingredientRes = await fetch(ingredientUrl);
    const ingredientData = await ingredientRes.json();

    if (!ingredientData.ingredients || ingredientData.ingredients.length === 0) {
      emptyState.style.display = "block";
      emptyState.innerHTML = `
        <div class="empty-icon">
          <i class="fas fa-info-circle"></i>
        </div>
        <div class="empty-title">No ingredients found</div>
        <div class="empty-text">
          This recipe doesn't have ingredient information available 🍽️
        </div>
      `;
      return;
    }

    // Show results count
    resultsCount.textContent = ingredientData.ingredients.length;
    resultsCount.style.display = "inline-block";

    ingredientData.ingredients.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = "ingredient-item";
      li.style.animationDelay = `${index * 0.1}s`;
      
      // Create icon
      const icon = document.createElement("div");
      icon.className = "ingredient-icon";
      icon.innerHTML = '<i class="fas fa-leaf"></i>';
      
      // Create text
      const text = document.createElement("div");
      text.className = "ingredient-text";
      const amount = item.amount?.metric;
      text.textContent = amount
        ? `${item.name} — ${amount.value} ${amount.unit}`
        : item.name;
      
      li.appendChild(icon);
      li.appendChild(text);
      list.appendChild(li);
    });

    // Step 3: Get cooking instructions
    if (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0) {
      const instructions = recipe.analyzedInstructions[0].steps;
      
      const instructionsSection = document.createElement("div");
      instructionsSection.style.background = "linear-gradient(135deg, #f0fff4, #e6fffa)";
      instructionsSection.style.padding = "25px";
      instructionsSection.style.borderRadius = "16px";
      instructionsSection.style.border = "1px solid #c6f6d5";
      instructionsSection.style.marginTop = "20px";

      const instructionsTitle = document.createElement("h3");
      instructionsTitle.innerHTML = `
        <i class="fas fa-list-ol" style="color: var(--secondary); margin-right: 10px;"></i>
        Cooking Instructions
      `;
      instructionsTitle.style.fontSize = "1.3rem";
      instructionsTitle.style.color = "var(--text)";
      instructionsTitle.style.marginBottom = "20px";
      instructionsTitle.style.fontWeight = "600";
      instructionsTitle.style.textAlign = "center";

      const instructionsList = document.createElement("ol");
      instructionsList.style.padding = "0";
      instructionsList.style.margin = "0";
      instructionsList.style.listStyle = "none";

      instructions.forEach((step, index) => {
        const stepItem = document.createElement("li");
        stepItem.style.display = "flex";
        stepItem.style.alignItems = "flex-start";
        stepItem.style.marginBottom = "15px";
        stepItem.style.padding = "15px";
        stepItem.style.background = "white";
        stepItem.style.borderRadius = "12px";
        stepItem.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.05)";
        stepItem.style.animation = `fadeInUp 0.4s ease ${index * 0.1}s both`;

        const stepNumber = document.createElement("div");
        stepNumber.style.width = "28px";
        stepNumber.style.height = "28px";
        stepNumber.style.background = "var(--secondary)";
        stepNumber.style.color = "white";
        stepNumber.style.borderRadius = "50%";
        stepNumber.style.display = "flex";
        stepNumber.style.alignItems = "center";
        stepNumber.style.justifyContent = "center";
        stepNumber.style.fontWeight = "600";
        stepNumber.style.fontSize = "14px";
        stepNumber.style.marginRight = "15px";
        stepNumber.style.flexShrink = "0";
        stepNumber.textContent = index + 1;

        const stepText = document.createElement("div");
        stepText.style.flex = "1";
        stepText.style.color = "var(--text)";
        stepText.style.lineHeight = "1.5";
        stepText.textContent = step.step;

        stepItem.appendChild(stepNumber);
        stepItem.appendChild(stepText);
        instructionsList.appendChild(stepItem);
      });

      instructionsSection.appendChild(instructionsTitle);
      instructionsSection.appendChild(instructionsList);
      instructionsContainer.appendChild(instructionsSection);
      instructionsContainer.style.display = "block";
    }

  } catch (err) {
    console.error(err);
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
