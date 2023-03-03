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
//<i class="bi bi-heart"></i>
//<i class="bi bi-heart-fill"></i>
function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li class="story-id" data-story-id="${story.storyId}">
      <span class="heart">
        <i class="bi bi-heart"></i>
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

/** takes form data, submits a story to the api,
 *  and displays the story on the screen
*/
async function submitUserStory(evt) {
  evt.preventDefault();
  console.log("submit function called")
  const author = $('#story-author').val();
  const title = $('#story-title').val();
  const url = $('#story-url').val();
  const storyData = {author, title, url};
  const userStoryInfo = await storyList.addStory(currentUser, storyData);
  $submitForm.hide();
  const userStoryMarkup = generateStoryMarkup(userStoryInfo);
  $allStoriesList.prepend(userStoryMarkup);
}

$submitForm.on("submit", submitUserStory);
$allStoriesList.on("click", $(".heart"), favoriteOrUnfavorite)

/** Calls the removeFavorite or addFavorite after checking if given story is in
 * user's favorites.
 */

function favoriteOrUnfavorite(evt) {
  evt.preventDefault();
  const id = $(evt.target).closest(".story-id").data("story-id");
  const clickedStory = Story.getStoryByID(id);
  if (currentUser.favorites.some(story => story.storyId === clickedStory.storyId)){
    currentUser.removeFavorite(clickedStory);
    console.log("this is already one of our favorites");
  } else {
    currentUser.addFavorite(clickedStory);
    console.log("this is not one of our favorites");
  }
}