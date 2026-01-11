import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get reviews without seller response from last 24h
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const allReviews = await base44.asServiceRole.entities.Review.list('-created_date', 100);
    const unansweredReviews = allReviews.filter(r => 
      !r.sellerResponse && 
      new Date(r.created_date) > oneDayAgo
    );

    console.log(`Found ${unansweredReviews.length} unanswered reviews`);

    const results = [];
    let responded = 0;
    let skipped = 0;

    for (const review of unansweredReviews.slice(0, 20)) { // Process max 20
      try {
        const response = await base44.asServiceRole.functions.invoke('generateReviewResponse', {
          reviewId: review.id,
          autoPublish: true
        });

        if (response.data?.success && response.data?.autoPublished) {
          responded++;
        } else {
          skipped++;
        }

        results.push({
          reviewId: review.id,
          rating: review.rating,
          status: response.data?.autoPublished ? 'published' : 'generated_only',
          response: response.data?.generatedResponse?.text
        });

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Error processing review ${review.id}:`, error);
        results.push({
          reviewId: review.id,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      totalProcessed: results.length,
      responded,
      skipped,
      results
    });

  } catch (error) {
    console.error('Auto review response error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});