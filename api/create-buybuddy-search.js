export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const data = req.body;

  const apiKey = '2o55uwntnel-2z89e6mheqk';  // Your Buying Buddy API key
  const mlsId = 'YOUR_MLS_ID_HERE';  // ← Replace this! e.g., 'mfr' or whatever your dashboard shows

  const baseUrl = 'https://www.leadsandcontacts.com/api-lead/add';

  const formData = new URLSearchParams();
  formData.append('api_key', apiKey);
  formData.append('email', data.email);
  formData.append('first_nm', data.first_name);
  formData.append('last_nm', data.last_name);
  formData.append('phone', data.phone || '');
  formData.append('listing_alert', '1');
  formData.append('listing_alert_nm', data.search_name || 'Custom Tampa Bay Search from Grok Chat');
  formData.append('listing_alert_frequency', data.saved_search_frequency?.toLowerCase() || 'daily');
  formData.append('welcome_email', 'true');  // Sends auto email with link/alerts

  // Build filter_string
  let filter = `mls_id:${mlsId}`;
  if (data.location) {
    const city = data.location.split(',')[0].trim();  // e.g., "Hyde Park" from "Hyde Park, Tampa FL"
    filter += `+city:${city}`;
  }
  if (data.min_price) filter += `+price_min:${data.min_price}`;
  if (data.max_price) filter += `+price_max:${data.max_price}`;
  if (data.min_beds) filter += `+beds_min:${data.min_beds}`;
  if (data.min_baths) filter += `+baths_min:${data.min_baths}`;
  if (data.property_type) filter += `+property_type:${data.property_type.toLowerCase()}`;
  // Add other_criteria if needed (e.g., keywords like pool)
  if (data.other_criteria) filter += `+keywords:${data.other_criteria.replace(/,/g, '+')}`;

  formData.append('filter_string', filter);

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });

    const result = await response.json();

    if (result.success === 'true') {
      res.status(200).json({ success: true, message: 'Lead and saved search created', lead_id: result.lead_id });
    } else {
      res.status(500).json({ success: false, error: result.msg || 'API error' });
    }
  } catch (error) {
    console.error('Error calling Buying Buddy API:', error);
    res.status(500).json({ success: false, error: 'Failed to connect to Buying Buddy' });
  }
}
    });

    if (!zapResponse.ok) {
      throw new Error(`Zapier responded with ${zapResponse.status}`);
    }

    // For now, just confirm success (later we can enhance to return a real link if Zap sends one back)
    res.status(200).json({ success: true, message: 'Search data sent to Buying Buddy via Zapier' });
  } catch (error) {
    console.error('Error forwarding to Zapier:', error);
    res.status(500).json({ success: false, error: 'Failed to create search' });
  }
}
