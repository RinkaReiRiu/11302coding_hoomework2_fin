let video;
let poseNet;
let poses = [];
let skeletons = [];
let modelReady = false;
let question = [];
let questionNo = 0;
let givenAnswer, correctAnswer;

function preload() {
  question = loadTable("qa.csv", "csv", "header"); // Load the question CSV file
}

function setup() {
  createCanvas(windowWidth, windowHeight); // Create full-sized canvas

  // Create full-sized video capture element
  video = createCapture(VIDEO);
  video.size(windowWidth, windowHeight);
  video.hide();

  // Load PoseNet model
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', getPoses);
  noStroke();
  frameRate(30); // Set frame rate to 30 FPS
}

function getPoses(results) { // Callback function for pose detection
  if (results.length > 0) {
    poses = results[0].pose.keypoints;
    skeletons = results[0].skeleton;
  }
}

function modelLoaded() { // Callback function when the model is loaded
  console.log('PoseNet model loaded');
  modelReady = true;
}

function draw() {
  background(0);
  // Draw mirrored video
  drawCamera();
  getCurrentQuestion (); // Get the current question
  poseDetection(); // Call pose detection function
  showQuestion(); // Show the question
  // Show loading if video is not ready
  if (!modelReady) {
    push();
      textAlign(CENTER, CENTER);
      textSize(64);
      fill(255);
      text('Loading...', width / 2, height / 2);
    pop();
  }
}

function drawCamera() { // Draw the mirrored camera
  push();
    translate(video.width, 0);
    scale(-1, 1);
    image(video, 0, 0, video.width, video.height);
  pop();
}

function getCurrentQuestion() {
  // 取得當前題目資料
  let row = question.getRow(questionNo);
  return {
    no: row.get("no"),
    question: row.get("question"),
    answer: row.get("answer"),
  };
}

function poseDetection() { // Function to detect poses
  fill(0);
  stroke(255);
  strokeWeight(2);
  // Draw the keypoints and skeletons
  if (poses.length > 0) {
    let rightWrist = poses.find(p => p.part === "rightWrist"); // Find right hand
    let leftWrist = poses.find(p => p.part === "leftWrist"); // Find left hand

  if (leftWrist.position.y < height / 2 && rightWrist.position.y < height / 2) {} 
    else if (leftWrist.position.y < height / 2) { // Check if left hand is above the center
      givenAnswer = "V";
      checkAnswer ();
      textSize(64);
      text("V", width / 4, height / 2);
    } 
    else if (rightWrist.position.y < height / 2) { // Check if right hand is above the center
      givenAnswer = "X";
      checkAnswer ();
      textSize(64);
      text("X", width * 3 / 4, height / 2);
    }
  }
}

function showQuestion() { // Function to display the question
  let currentQuestion = getCurrentQuestion();
  stroke('#170033');
  fill('#7D56AD');
  textAlign(CENTER, CENTER);
  textSize(16);
  text(currentQuestion.question, width / 2, height / 8); // Display the question
}

function checkAnswer() { // Function to check the answer
  correctAnswer = getCurrentQuestion().answer; // Get the correct answer
  console.log(`Given Answer: ${givenAnswer}, Correct Answer: ${correctAnswer}`);
  // Compare the given answer with the correct answer
  if (givenAnswer === correctAnswer) {
    console.log("Correct!");
    fill(0, 255, 0); // Green for correct answer
  } else {
    console.log("Incorrect!");
    fill(255, 0, 0); // Red for incorrect answer
  }
  setTimeout(() => {
    questionNo++;
    if (questionNo >= question.getRowCount()) {
      questionNo = 1; // Reset to the first question
    }
  }, 2000); // Wait for 2 seconds before moving to the next question
}

function windowResized() { // Handle window resizing
  resizeCanvas(windowWidth, windowHeight);
}