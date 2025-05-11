import { useState } from "react";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { PostType, PostTypeValues } from "../../shared/schema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Image, Tags } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";

// Form schema for post creation
const postFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  imageFile: z.instanceof(File).optional(),
  tags: z.string().optional(),
  postType: z.enum([PostType.TEXT, PostType.IMAGE]).default(PostType.TEXT),
});

type FormValues = z.infer<typeof postFormSchema>;

export default function CreatePostPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: "",
      content: "",
      tags: "",
      postType: PostType.TEXT,
    },
  });

  // Image upload mutation
  const imageUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      return await apiRequest("POST", "/api/upload/image", formData);
    },
  });

  // Post creation mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      console.log("Creating post with data:", data);
      return await apiRequest("POST", "/api/posts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/recent'] });
      queryClient.invalidateQueries({ queryKey: [`/api/posts/user/${user?.id}`] });
      
      toast({
        title: "Post created successfully!",
        description: "Your post is now live for the community.",
      });
      
      navigate("/posts");
    },
    onError: (error) => {
      console.error("Post creation error:", error);
      toast({
        title: "Failed to create post",
        description: error instanceof Error ? error.message : "Server error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a post",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // If there's an image, upload it first
      let imageUrl = null;
      if (values.imageFile) {
        const imageResult = await imageUploadMutation.mutateAsync(values.imageFile);
        if (imageResult && typeof imageResult === 'object' && 'url' in imageResult) {
          imageUrl = imageResult.url as string;
        }
      }
      
      // Process tags - ensure we have a valid array for the server
      const tagsArray = values.tags 
        ? (values.tags as string).split(',').map((tag: string) => tag.trim()).filter(Boolean) 
        : [];
      
      // Determine post type based on image presence and selected value in form
      const postType = imageUrl ? PostType.IMAGE : values.postType;
      
      console.log("Submitting post with data:", {
        title: values.title,
        content: values.content,
        imageUrl,
        tags: tagsArray,
        postType
      });
      
      // Build a properly formatted post object
      const postData: {
        userId: number;
        title: string;
        content: string;
        postType: typeof PostType[keyof typeof PostType];
        tags: string[];
        imageUrl?: string | null;
      } = {
        userId: user.id as number,
        title: values.title as string,
        content: values.content as string,
        postType: postType,
        tags: tagsArray
      };
      
      // Only add imageUrl if it exists
      if (imageUrl) {
        postData.imageUrl = imageUrl;
      }
      
      console.log("Final post data being sent to server:", postData);
      
      // Create the post with the image URL if available
      await createPostMutation.mutateAsync(postData);
      
      // Show success toast
      toast({
        title: "Post created successfully!",
        description: "Your post has been published.",
        variant: "default",
      });
      
      // Reset the form
      form.reset({
        title: "",
        content: "",
        tags: "",
        postType: PostType.TEXT,
        imageFile: undefined,
      });
      
      // Clear the image preview
      setImagePreview(null);
      
    } catch (error) {
      console.error("Error in post creation process:", error);
      
      // Enhanced error logging for debugging
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      } else {
        console.error("Unknown error type:", typeof error);
        console.error("Error serialized:", JSON.stringify(error));
      }
      
      // Show error details in the UI
      toast({
        title: "Failed to create post",
        description: error instanceof Error && error.message 
          ? error.message 
          : "Server error - please try again later",
        variant: "destructive",
      });
    }
  };
  
  // Handle image file change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("imageFile", file);
      
      // When an image is uploaded, also update the post type to IMAGE
      form.setValue("postType", PostType.IMAGE);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      
      // Clean up previous preview URL
      return () => URL.revokeObjectURL(url);
    }
  };
  
  const isLoading = imageUploadMutation.isPending || createPostMutation.isPending;
  
  return (
    <div className="container py-10">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Create New Post</h1>
        <p className="text-muted-foreground">
          Share updates, thoughts, or announcements with your followers
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a title for your post" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What's on your mind?" 
                        className="min-h-[200px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <div className="flex items-center gap-2">
                      <Tags className="h-4 w-4 text-gray-400" />
                      <FormControl>
                        <Input 
                          placeholder="music, electronic, announcement (comma separated)" 
                          {...field} 
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="imageFile"
                render={() => (
                  <FormItem>
                    <FormLabel>Image (Optional)</FormLabel>
                    <FormControl>
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="image-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-700"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Image className="w-8 h-8 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              JPG, PNG, WebP or GIF (MAX. 5MB)
                            </p>
                          </div>
                          <input 
                            id="image-upload" 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  "Publish Post"
                )}
              </Button>
            </form>
          </Form>
        </div>
        
        <div>
          <h3 className="text-xl font-medium mb-4">Post Preview</h3>
          
          <Card className="overflow-hidden">
            {imagePreview && (
              <div className="aspect-video bg-gray-100 dark:bg-gray-800">
                <img 
                  src={imagePreview} 
                  alt="Post preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <CardContent className="p-4">
              <h4 className="font-semibold text-lg line-clamp-2">
                {form.watch("title") || "Post Title"}
              </h4>
              
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                {form.watch("content") || "Your post content will appear here..."}
              </div>
              
              {form.watch("tags") && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {(form.watch("tags") as string)?.split(',').map((tag: string, i: number) => (
                    tag.trim() && (
                      <span 
                        key={i} 
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded-full"
                      >
                        #{tag.trim()}
                      </span>
                    )
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}