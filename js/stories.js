"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */
function generateStoryMarkup(story) {

  console.log('generateStoryMarkup is using story: ', story)
  const iconClassName = generateFavoriteMarkup(currentUser, story);//TODO: get rid of span probably, heart vs Heart
  const hostName = story.getHostName();
  return $(`
      <li class="story-id" data-story-id="${story.storyId}">
      <span class="heart">
        <i class="${iconClassName}"></i>
      </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */
function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}


/** loop through all of our favorite stories and generate HTML for them */
function putFavoritesOnPage() {
  console.log("putFavoritesOnPage called!")
  $favoriteStoriesList.empty();

  for (let story of currentUser.favorites) {
    console.log(story instanceof Story);
    const $story = generateStoryMarkup(story);
    $favoriteStoriesList.prepend($story);
  }

  $favoriteStoriesList.show();
}

/** takes form data, submits a story to the api,
 *  and displays the story on the screen
*/
async function submitUserStory(evt) {
  evt.preventDefault();

  const author = $('#story-author').val();
  const title = $('#story-title').val();
  const url = $('#story-url').val();
  const storyData = {author, title, url};

  const userStoryInfo = await storyList.addStory(currentUser, storyData);
  const userStoryMarkup = generateStoryMarkup(userStoryInfo);
  $submitForm.hide();
  $allStoriesList.prepend(userStoryMarkup);
}

$submitForm.on("submit", submitUserStory);
$body.on("click", ".Heart", toggleFavorite)

/** Calls the removeFavorite or addFavorite after checking if given story is in
 * user's favorites.
 */
async function toggleFavorite(evt) {
  evt.preventDefault();

  const id = $(evt.target).closest(".story-id").data("story-id");
  const clickedStory = await Story.getStoryByID(id);
  console.log("toggle favorites is using clickedStory: ", clickedStory)
  console.log("the clicked story is a story? ", clickedStory instanceof Story)

  if (currentUser.favorites.some(story => story.storyId === clickedStory.storyId)){
    await currentUser.removeFavorite(clickedStory);
  } else {
    await currentUser.addFavorite(clickedStory);
  }

  const favoriteMarkup = generateFavoriteMarkup(currentUser, clickedStory);
  $(evt.target).removeClass('bi bi-heart bi-heart-fill').addClass(favoriteMarkup);
}

/** takes a user and story, returns the appropriate class to display
 * whether or not the story is a favorite as a string.
 */
function generateFavoriteMarkup(user, story) {
  let iconClassName = 'bi bi-heart Heart';
  if (user.favorites.some(s => s.storyId === story.storyId)) {
    iconClassName = 'bi bi-heart-fill Heart';
  }
  return iconClassName;
}