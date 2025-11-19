'use client';

import { useState, useMemo } from 'react';
import type { Product, Review } from '@/lib/types';
import { Star, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from './ui/separator';

const StarRating = ({ rating, onRate, size = 'md' }: { rating: number, onRate?: (rating: number) => void, size?: 'sm' | 'md' }) => {
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={cn(
                        'cursor-pointer text-yellow-400',
                        star <= rating ? 'fill-yellow-400' : 'fill-muted stroke-muted-foreground',
                        starSize
                    )}
                    onClick={() => onRate?.(star)}
                />
            ))}
        </div>
    );
};

const ReviewForm = ({ onSubmit }: { onSubmit: (review: { text: string, rating: number }) => void }) => {
    const [rating, setRating] = useState(0);
    const [text, setText] = useState('');
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast({ variant: 'destructive', title: 'Please select a rating' });
            return;
        }
        if (!text.trim()) {
            toast({ variant: 'destructive', title: 'Please write your review' });
            return;
        }
        onSubmit({ text, rating });
        setText('');
        setRating(0);
    };

    return (
        <div>
            <h3 className="text-xl font-semibold mb-2">Submit Your Review</h3>
            <p className="text-sm text-muted-foreground mb-4">Your email address will not be published. Required fields are marked *</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <Label htmlFor="review-text" className="mb-2 block">Write your opinion about the product</Label>
                    <Textarea
                        id="review-text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Write Your Review Here..."
                        rows={5}
                        required
                    />
                </div>
                <div className="flex items-center gap-4">
                    <Label className="font-medium">Your Rating:</Label>
                    <StarRating rating={rating} onRate={setRating} />
                </div>
                <Button type="submit">Submit Review</Button>
            </form>
        </div>
    );
};

const Label = ({htmlFor, className, children} : {htmlFor?: string, className?: string, children: React.ReactNode}) => (
    <label htmlFor={htmlFor} className={cn('text-sm font-medium', className)}>{children}</label>
)


export function Reviews({ product }: { product: Product }) {
    const [reviews, setReviews] = useState<Review[]>(product.reviews);
    const { toast } = useToast();

    const reviewSummary = useMemo(() => {
        if (reviews.length === 0) {
            return {
                average: 0,
                total: 0,
                recommended: 0,
                distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            };
        }

        const total = reviews.length;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        const average = sum / total;
        const recommendedCount = reviews.filter(r => r.rating >= 4).length;
        const recommended = (recommendedCount / total) * 100;
        
        const distribution = reviews.reduce((acc, r) => {
            acc[r.rating as keyof typeof acc]++;
            return acc;
        }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

        return {
            average: parseFloat(average.toFixed(1)),
            total,
            recommended: parseFloat(recommended.toFixed(2)),
            distribution: {
                5: (distribution[5] / total) * 100,
                4: (distribution[4] / total) * 100,
                3: (distribution[3] / total) * 100,
                2: (distribution[2] / total) * 100,
                1: (distribution[1] / total) * 100,
            }
        };
    }, [reviews]);
    
    const handleReviewSubmit = (review: { text: string; rating: number; }) => {
        const newReview: Review = {
            id: (reviews.length + 1).toString(),
            author: 'Admin', // Placeholder for logged in user
            date: new Date().toISOString(),
            rating: review.rating,
            text: review.text,
        };
        setReviews(prev => [newReview, ...prev]);
        toast({ title: "Review Submitted", description: "Thank you for your feedback!" });
    };

    return (
        <div className="space-y-12">
            <h2 className="font-headline text-3xl font-bold">Reviews</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
                 <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <p className="text-6xl font-bold text-primary">{reviewSummary.average.toFixed(1)}</p>
                        <div>
                            <p className="font-semibold">Average Rating</p>
                            <div className="flex items-center gap-1">
                                <StarRating rating={reviewSummary.average} />
                                <span className="text-sm text-muted-foreground">({reviewSummary.total} Reviews)</span>
                            </div>
                        </div>
                    </div>
                    <div>
                         <p className="text-lg"><span className="font-bold">{reviewSummary.recommended}%</span> Recommended ({reviews.filter(r => r.rating >= 4).length} of {reviews.length})</p>
                    </div>
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map(star => (
                             <div key={star} className="flex items-center gap-2">
                                <p className="text-xs font-medium text-muted-foreground flex gap-1">{star} <Star className="w-3 h-3" /></p>
                                <Progress value={reviewSummary.distribution[star as keyof typeof reviewSummary.distribution]} className="w-full h-2" />
                                <p className="text-xs font-medium text-muted-foreground w-8 text-right">{Math.round(reviewSummary.distribution[star as keyof typeof reviewSummary.distribution])}%</p>
                            </div>
                        ))}
                    </div>
                </div>
                <ReviewForm onSubmit={handleReviewSubmit} />
            </div>

            <Separator />

            {reviews.length > 0 ? (
                <div className="space-y-8">
                    {reviews.map(review => (
                        <div key={review.id} className="flex gap-4">
                            <Avatar>
                                <AvatarFallback><User/></AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                               <div className="flex items-center justify-between">
                                 <div>
                                    <p className="font-bold">{review.author}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(review.date).toLocaleString()}</p>
                                 </div>
                                  <StarRating rating={review.rating} size="sm" />
                               </div>
                               <p className="mt-2 text-muted-foreground italic">"{review.text}"</p>
                               {review.reply && (
                                   <div className="mt-4 ml-4 p-4 bg-muted/50 rounded-lg flex gap-4">
                                       <Avatar className="w-8 h-8">
                                          <AvatarImage src="https://picsum.photos/seed/shoplogo/32/32" alt="Shop Logo" />
                                          <AvatarFallback>{review.reply.author.charAt(0)}</AvatarFallback>
                                       </Avatar>
                                       <div className="flex-1">
                                            <p className="font-bold">{review.reply.author}</p>
                                            <p className="text-xs text-muted-foreground">Replied on {new Date(review.reply.date).toLocaleString()}</p>
                                            <p className="mt-2 text-sm">{review.reply.text}</p>
                                       </div>
                                   </div>
                               )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-muted-foreground">This product has no reviews yet. Be the first to leave a review!</p>
            )}

        </div>
    );
}
