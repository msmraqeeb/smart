
'use client';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getProducts } from '@/lib/data';
import type { Product, Review } from '@/lib/types';
import withAdminAuth from '@/components/withAdminAuth';
import { Star, MoreHorizontal, Trash2, Reply } from 'lucide-react';
import Link from 'next/link';
import { useFirestore } from '@/firebase';
import { doc, deleteDoc, updateDoc, serverTimestamp, getDocs, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

type ReviewWithProduct = Review & {
    productName: string;
    productId: string;
    productSlug: string;
};

function ReplyDialog({ review, onReply, onOpenChange, open }: { review: ReviewWithProduct, onReply: (text: string) => void, open: boolean, onOpenChange: (open: boolean) => void }) {
    const [replyText, setReplyText] = useState(review.reply?.text || '');
    
    useEffect(() => {
        if (open) {
            setReplyText(review.reply?.text || '');
        }
    }, [open, review]);

    const handleReplySubmit = () => {
        onReply(replyText);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reply to review</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <blockquote className="border-l-2 pl-6 italic">
                        "{review.text}"
                    </blockquote>
                    <div className="space-y-2">
                        <Label htmlFor="reply-text">Your Reply</Label>
                        <Textarea 
                            id="reply-text" 
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write your reply here..."
                            rows={4}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleReplySubmit}>Submit Reply</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function AdminReviewsPage() {
    const [reviews, setReviews] = useState<ReviewWithProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [reviewToDelete, setReviewToDelete] = useState<ReviewWithProduct | null>(null);
    const [reviewToReply, setReviewToReply] = useState<ReviewWithProduct | null>(null);
    const firestore = useFirestore();
    const { toast } = useToast();

    const fetchReviews = async () => {
        setLoading(true);
        if (!firestore) {
            setLoading(false);
            return;
        }
        const products = await getProducts();
        const allReviews: ReviewWithProduct[] = [];
        for (const product of products) {
            const productReviews = await getProductReviews(product.id);
            productReviews.forEach(review => {
                allReviews.push({
                    ...review,
                    productName: product.name,
                    productId: product.id,
                    productSlug: product.slug,
                });
            });
        }
        allReviews.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
        setReviews(allReviews);
        setLoading(false);
    };

    const getProductReviews = async (productId: string) => {
        if (!firestore) return [];
        const querySnapshot = await getDocs(collection(doc(firestore, 'products', productId), 'reviews'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
    }


    useEffect(() => {
        fetchReviews();
    }, [firestore]);
    
    const handleDelete = async () => {
        if (!reviewToDelete || !firestore) return;

        try {
            await deleteDoc(doc(firestore, "products", reviewToDelete.productId, "reviews", reviewToDelete.id));
            toast({
                title: "Review Deleted",
                description: `The review has been successfully deleted.`,
            });
            setReviewToDelete(null);
            fetchReviews();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: "Error deleting review",
                description: "There was a problem deleting the review. Please try again.",
            });
        }
    };
    
    const handleReply = async (replyText: string) => {
        if (!reviewToReply || !firestore) return;

        const reviewRef = doc(firestore, "products", reviewToReply.productId, "reviews", reviewToReply.id);
        
        try {
            await updateDoc(reviewRef, {
                reply: {
                    text: replyText,
                    author: "Store Owner",
                    date: serverTimestamp(),
                }
            });
            toast({
                title: "Reply Submitted",
                description: "Your reply has been added to the review."
            });
            setReviewToReply(null);
            fetchReviews();
        } catch(error) {
            toast({
                variant: 'destructive',
                title: "Error submitting reply",
                description: "There was a problem submitting your reply.",
            });
        }
    }

    return (
        <div>
            {reviewToReply && (
                 <ReplyDialog 
                    review={reviewToReply} 
                    onReply={handleReply} 
                    open={!!reviewToReply}
                    onOpenChange={(open) => !open && setReviewToReply(null)}
                />
            )}
            <AlertDialog open={!!reviewToDelete} onOpenChange={(open) => !open && setReviewToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the review by
                            "{reviewToDelete?.author}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Card>
                <CardHeader>
                    <CardTitle>All Reviews</CardTitle>
                    <CardDescription>Manage customer reviews for all products.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Author</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Review</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">Loading reviews...</TableCell>
                                </TableRow>
                            ) : reviews.length > 0 ? (
                                reviews.map(review => (
                                    <TableRow key={review.id}>
                                        <TableCell className='font-semibold'>
                                            <Link href={`/products/${review.productSlug}`} className='hover:underline'>
                                                {review.productName}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{review.author}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <span>{review.rating}</span>
                                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            </div>
                                        </TableCell>
                                        <TableCell className='max-w-xs'>
                                            <p className='truncate'>{review.text}</p>
                                            {review.reply && <p className='text-xs text-green-600 truncate mt-1'>Replied: "{review.reply.text}"</p>}
                                        </TableCell>
                                        <TableCell>{format(review.createdAt.toDate(), 'PPP')}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => setReviewToReply(review)}>
                                                        <Reply className="mr-2 h-4 w-4" />
                                                        {review.reply ? 'Edit Reply' : 'Reply'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => setReviewToDelete(review)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No reviews found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default withAdminAuth(AdminReviewsPage);
