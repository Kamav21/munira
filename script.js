document.addEventListener('DOMContentLoaded', () => {
    // Game variables
    const puzzleContainer = document.getElementById('puzzle-container');
    const resetButton = document.getElementById('reset-button');
    const playAgainButton = document.getElementById('play-again');
    const movesDisplay = document.getElementById('moves');
    const finalMovesDisplay = document.getElementById('final-moves');
    const winMessage = document.getElementById('win-message');
    
    const castleImageBtn = document.getElementById('castle-image');
    const dragonImageBtn = document.getElementById('dragon-image');
    const castleDragonImageBtn = document.getElementById('castle-dragon-image');
    
    let gridSize = 4; // 4x4 puzzle
    let pieces = [];
    let currentPieces = [];
    let emptyCell = { row: gridSize - 1, col: gridSize - 1 };
    let moves = 0;
    let gameActive = false;
    
    // Image URLs for the castle and dragon theme
    const imageUrls = {
        castle: 'https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Castle image
        dragon: 'https://images.unsplash.com/photo-1577493340887-b7bfff550145?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', // Dragon image
        castleDragon: 'https://images.unsplash.com/photo-1578164252034-9e5e69a5bf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80' // Castle and dragon image
    };
    
    let currentImageUrl = imageUrls.castleDragon;
    
    // Load the image first to ensure it's ready before creating the puzzle
    function initializeGame() {
        loadSelectedImage();
    }
    
    // Load the currently selected image
    function loadSelectedImage() {
        const img = new Image();
        img.onload = () => {
            createPuzzlePieces(img);
            resetGame();
        };
        img.onerror = () => {
            alert("Failed to load image. Please try again or use a different image.");
            // Fallback to a solid color if the image fails to load
            createPuzzlePieces();
            resetGame();
        };
        img.src = currentImageUrl;
    }
    
    // Create the puzzle pieces
    function createPuzzlePieces(img) {
        puzzleContainer.innerHTML = '';
        pieces = [];
        currentPieces = [];
        
        const pieceSize = puzzleContainer.offsetWidth / gridSize;
        
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const piece = document.createElement('div');
                piece.className = 'puzzle-piece';
                piece.style.width = `${pieceSize}px`;
                piece.style.height = `${pieceSize}px`;
                
                // If we have an image, set the background position to show the correct piece of the image
                if (img) {
                    piece.style.backgroundImage = `url(${img.src})`;
                    piece.style.backgroundSize = `${gridSize * 100}% ${gridSize * 100}%`;
                    piece.style.backgroundPosition = `${(col * 100) / (gridSize - 1)}% ${(row * 100) / (gridSize - 1)}%`;
                } else {
                    // Fallback to a color gradient if no image
                    piece.style.backgroundColor = `hsl(${(row * gridSize + col) * 10}, 70%, 60%)`;
                }
                
                piece.dataset.row = row;
                piece.dataset.col = col;
                
                // Store the correct position for later validation
                pieces.push({ 
                    element: piece, 
                    correctRow: row, 
                    correctCol: col,
                    currentRow: row,
                    currentCol: col
                });
                
                puzzleContainer.appendChild(piece);
            }
        }
        
        // Set the last piece as empty
        const lastPiece = pieces[pieces.length - 1];
        lastPiece.element.classList.add('empty');
        
        // Position the pieces correctly
        updatePuzzleDisplay();
        
        // Add click event to the pieces
        pieces.forEach(piece => {
            if (!piece.element.classList.contains('empty')) {
                piece.element.addEventListener('click', () => {
                    if (!gameActive) return;
                    
                    const row = parseInt(piece.currentRow);
                    const col = parseInt(piece.currentCol);
                    
                    // Check if the piece is adjacent to the empty cell
                    if (isAdjacent(row, col, emptyCell.row, emptyCell.col)) {
                        movePiece(piece);
                        checkWin();
                    }
                });
            }
        });
    }
    
    // Update the visual display of the puzzle
    function updatePuzzleDisplay() {
        const pieceSize = puzzleContainer.offsetWidth / gridSize;
        
        pieces.forEach(piece => {
            piece.element.style.transform = `translate(${piece.currentCol * pieceSize}px, ${piece.currentRow * pieceSize}px)`;
        });
    }
    
    // Check if two puzzle cells are adjacent (can be moved)
    function isAdjacent(row1, col1, row2, col2) {
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }
    
    // Move a piece to the empty cell
    function movePiece(piece) {
        // Save the old position of the empty cell
        const oldEmptyRow = emptyCell.row;
        const oldEmptyCol = emptyCell.col;
        
        // Update the empty cell position to the clicked piece's position
        emptyCell.row = piece.currentRow;
        emptyCell.col = piece.currentCol;
        
        // Update the clicked piece's position to the old empty cell position
        piece.currentRow = oldEmptyRow;
        piece.currentCol = oldEmptyCol;
        
        // Update the moves counter
        moves++;
        movesDisplay.textContent = moves;
        
        // Update the display
        updatePuzzleDisplay();
    }
    
    // Shuffle the puzzle
    function shufflePuzzle() {
        // Reset the empty cell to the bottom right
        emptyCell = { row: gridSize - 1, col: gridSize - 1 };
        
        // Reset all pieces to their original positions
        pieces.forEach(piece => {
            piece.currentRow = piece.correctRow;
            piece.currentCol = piece.correctCol;
        });
        
        // Make a series of random valid moves to shuffle
        const shuffleCount = 100 + gridSize * gridSize * 2; // More shuffles for larger grids
        
        for (let i = 0; i < shuffleCount; i++) {
            // Find all pieces adjacent to the empty cell
            const adjacentPieces = pieces.filter(piece => 
                !piece.element.classList.contains('empty') &&
                isAdjacent(piece.currentRow, piece.currentCol, emptyCell.row, emptyCell.col)
            );
            
            if (adjacentPieces.length > 0) {
                // Choose a random adjacent piece and move it
                const randomPiece = adjacentPieces[Math.floor(Math.random() * adjacentPieces.length)];
                movePiece(randomPiece);
            }
        }
        
        // Reset moves counter
        moves = 0;
        movesDisplay.textContent = moves;
        
        // Make sure puzzle is solvable (this is a simple approach)
        // If needed, we can implement a proper solvability check
        
        updatePuzzleDisplay();
    }
    
    // Check if the puzzle is solved
    function checkWin() {
        const isWin = pieces.every(piece => {
            return piece.currentRow === piece.correctRow && piece.currentCol === piece.correctCol;
        });
        
        if (isWin) {
            gameActive = false;
            finalMovesDisplay.textContent = moves;
            winMessage.classList.add('active');
        }
    }
    
    // Reset the game
    function resetGame() {
        shufflePuzzle();
        gameActive = true;
        winMessage.classList.remove('active');
    }
    
    // Event listeners for buttons
    resetButton.addEventListener('click', resetGame);
    playAgainButton.addEventListener('click', resetGame);
    
    // Event listeners for image selection buttons
    castleImageBtn.addEventListener('click', () => {
        currentImageUrl = imageUrls.castle;
        setActiveImageButton(castleImageBtn);
        loadSelectedImage();
    });
    
    dragonImageBtn.addEventListener('click', () => {
        currentImageUrl = imageUrls.dragon;
        setActiveImageButton(dragonImageBtn);
        loadSelectedImage();
    });
    
    castleDragonImageBtn.addEventListener('click', () => {
        currentImageUrl = imageUrls.castleDragon;
        setActiveImageButton(castleDragonImageBtn);
        loadSelectedImage();
    });
    
    // Function to set active image button
    function setActiveImageButton(activeButton) {
        [castleImageBtn, dragonImageBtn, castleDragonImageBtn].forEach(btn => {
            btn.classList.remove('active');
        });
        activeButton.classList.add('active');
    }
    
    // Set default active button
    setActiveImageButton(castleDragonImageBtn);
    
    // Initialize the game
    initializeGame();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (pieces.length > 0) {
            updatePuzzleDisplay();
        }
    });
});
