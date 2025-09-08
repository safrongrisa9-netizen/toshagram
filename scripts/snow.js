document.addEventListener('DOMContentLoaded', function() {
    const snowContainer = document.getElementById('snow-container');
    const snowflakeCount = 100;
    
    for (let i = 0; i < snowflakeCount; i++) {
        createSnowflake();
    }
    
    function createSnowflake() {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        
        // Случайный размер
        const size = Math.random() * 5 + 2;
        snowflake.style.width = `${size}px`;
        snowflake.style.height = `${size}px`;
        
        // Случайная позиция
        const startPosition = Math.random() * 100;
        snowflake.style.left = `${startPosition}vw`;
        
        // Случайная задержка анимации
        const delay = Math.random() * 5;
        snowflake.style.animationDelay = `${delay}s`;
        
        // Случайная продолжительность анимации
        const duration = Math.random() * 10 + 5;
        snowflake.style.animationDuration = `${duration}s`;
        
        snowContainer.appendChild(snowflake);
        
        // После завершения анимации, пересоздаем снежинку
        snowflake.addEventListener('animationend', function() {
            snowflake.remove();
            createSnowflake();
        });
    }
});
