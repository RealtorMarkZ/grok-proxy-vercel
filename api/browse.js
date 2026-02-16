// api/browse.js
import fetch from 'node-fetch';
import cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, instructions } = req.body;

  if (!url || !instructions) {
    return res.status(400).json({ error: 'Missing url or instructions' });
  }

  try {
    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GrokProxy/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove scripts, styles, navigation, ads, footers (basic cleaning)
    $('script, style, nav, header, footer, .advertisement, .adsbygoogle').remove();

    // Get main content
    let textContent = $('body').text()
      .replace(/\s+/g, ' ')
      .trim();

    // If instructions are specific, try to extract targeted parts
    if (instructions.toLowerCase().includes('listings') || instructions.toLowerCase().includes('homes for sale')) {
      // Try to find listing-related sections (very basic)
      const listingText = $('.listing, .property, .home-card, [class*="listing"], [class*="property"]')
        .map((i, el) => $(el).text().trim())
        .get()
        .join('\n\n');

      if (listingText) {
        textContent = listingText;
      }
    }

    // Limit length (Grok has token limits)
    const maxLength = 8000;
    if (textContent.length > maxLength) {
      textContent = textContent.substring(0, maxLength) + '... (truncated)';
    }

    // Return summarized/extracted content
    res.status(200).json({
      success: true,
      summary: `Content from ${url}:\n\n${textContent}\n\nInstructions were: ${instructions}`
    });
  } catch (error) {
    console.error('Browse error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process page'
    });
  }
}

// Optional: Increase timeout for slower sites
export const config = {
  maxDuration: 30, // seconds
};
