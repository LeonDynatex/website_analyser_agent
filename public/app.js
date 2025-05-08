document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyze-btn');
    const generateBtn = document.getElementById('generate-btn');
    const resultsDiv = document.getElementById('results');
    const resultsContent = document.getElementById('results-content');

    // Analyze a single website  
    analyzeBtn.addEventListener('click', async () => {
        const urlInput = document.getElementById('website-url');
        const url = urlInput.value.trim();

        if (!url) {
            alert('Please enter a website URL');
            return;
        }

        // Show loading indicator  
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = 'Analyzing...';
        resultsDiv.classList.remove('hidden');
        resultsContent.innerHTML = '<div class="loader"></div><p>Analyzing website. This may take a minute...</p>';

        try {
            const response = await fetch('/api/analyze/website', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });

            const data = await response.json();

            if (response.ok) {
                // Format and display results  
                resultsContent.innerHTML = `  
          <h3>Analysis Results for ${data.url}</h3>  
          <p><strong>Title:</strong> ${data.title}</p>  
          <div>  
            <h4>Screenshots:</h4>  
            <div style="display: flex; gap: 20px;">  
              <div>  
                <p>Desktop:</p>  
                <img src="${data.screenshots.desktop}" alt="Desktop Screenshot" style="max-width: 400px;">  
              </div>  
              <div>  
                <p>Mobile:</p>  
                <img src="${data.screenshots.mobile}" alt="Mobile Screenshot" style="max-width: 200px;">  
              </div>  
            </div>  
          </div>  
          <h4>Design Elements:</h4>  
          <pre>${JSON.stringify(data.designElements, null, 2)}</pre>  
        `;
            } else {
                resultsContent.innerHTML = `<p>Error: ${data.error}</p>`;
            }
        } catch (error) {
            resultsContent.innerHTML = `<p>Error: ${error.message}</p>`;
        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = 'Analyze';
        }
    });

    // Generate style guide from multiple websites  
    generateBtn.addEventListener('click', async () => {
        const urlsInput = document.getElementById('website-urls');
        const urlsText = urlsInput.value.trim();

        if (!urlsText) {
            alert('Please enter at least one website URL');
            return;
        }

        const urls = urlsText.split('\n')
            .map(url => url.trim())
            .filter(url => url.length > 0);

        if (urls.length === 0) {
            alert('Please enter at least one valid website URL');
            return;
        }

        // Show loading indicator  
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
        resultsDiv.classList.remove('hidden');
        resultsContent.innerHTML = `<div class="loader"></div><p>Analyzing ${urls.length} websites and generating style guide. This may take several minutes...</p>`;

        try {
            const response = await fetch('/api/analyze/websites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ urls })
            });

            const data = await response.json();

            if (response.ok) {
                // Display style guide  
                resultsContent.innerHTML = `  
          <h3>Style Guide Generated</h3>  
          <p>Based on analysis of ${urls.length} websites</p>  
          <div>${data.styleGuide.html}</div>  
        `;
            } else {
                resultsContent.innerHTML = `<p>Error: ${data.error}</p>`;
            }
        } catch (error) {
            resultsContent.innerHTML = `<p>Error: ${error.message}</p>`;
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Style Guide';
        }
    });
});  
