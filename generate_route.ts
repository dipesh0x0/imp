/**
 * Internal Node.js Route: /api/generate/video
 * Proxies requests to the Modal GPU cluster for self-hosted video synthesis.
 */

export const handleVideoGeneration = async (req: any, res: any) => {
  const { prompt, quality, aspectRatio } = req.body;
  
  // Deployment specific Modal URLs
  const MODAL_DRAFT_URL = process.env.MODAL_DRAFT_URL || 'https://contentpilot-factory--generate-draft.modal.run';
  const MODAL_PROD_URL = process.env.MODAL_PROD_URL || 'https://contentpilot-factory--generate-production.modal.run';

  const targetUrl = quality === 'production' ? MODAL_PROD_URL : MODAL_DRAFT_URL;

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MODAL_AUTH_TOKEN}`
      },
      body: JSON.stringify({ 
        prompt, 
        aspect_ratio: aspectRatio 
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Modal Video Factory Error: ${errorData}`);
    }

    const data = await response.json();
    return res.json({
      url: data.url,
      engine: data.engine,
      quality: data.quality,
      status: 'completed'
    });
  } catch (error) {
    console.error("Video Generation Proxy Error:", error);
    return res.status(500).json({ error: "GPU Factory unreachable. Verify cluster status." });
  }
};

/**
 * Internal Node.js Route: /api/edit/video
 * Proxies video inpainting requests to the SAM2-powered Modal endpoint.
 */
export const handleVideoInpainting = async (req: any, res: any) => {
  const { videoUrl, maskCoordinates, prompt } = req.body;
  const MODAL_INPAINT_URL = process.env.MODAL_INPAINT_URL || 'https://contentpilot-factory--run-video-inpainting.modal.run';

  try {
    const response = await fetch(MODAL_INPAINT_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MODAL_AUTH_TOKEN}`
      },
      body: JSON.stringify({ 
        video_url: videoUrl, 
        mask_coordinates: maskCoordinates, 
        prompt 
      })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Inpainting Engine Error: ${errorText}`);
    }

    const data = await response.json();
    return res.json({
      url: data.url,
      engine: data.engine,
      status: 'success'
    });
  } catch (error) {
    console.error("Video Inpainting Proxy Error:", error);
    return res.status(500).json({ error: "Temporal mask processing failed." });
  }
};
