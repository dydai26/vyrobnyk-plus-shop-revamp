import React from "react";
import { Store } from "@/types";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";

interface StoreCarouselProps {
  stores: Store[];
}

const StoreCarousel: React.FC<StoreCarouselProps> = ({ stores }) => {
  return (
    <Carousel className="w-full max-w-5xl mx-auto">
      <CarouselContent>
        {stores.map((store) => (
          <CarouselItem key={store.id} className="basis-1/3 md:basis-1/4 lg:basis-1/5">
            <div className="p-2">
              <div className="flex flex-col items-center p-4">
                {store.url ? (
                  <a 
                    href={store.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center"
                  >
                    <div className="w-[200px] h-auto flex items-center justify-center">
                      <img 
                        src={store.logo} 
                        alt={store.name} 
                        className="max-w-full max-h-full object-contain" 
                      />
                    </div>
                  </a>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-[150px] h-auto flex items-center justify-center">
                      <img 
                        src={store.logo} 
                        alt={store.name} 
                        className="max-w-full max-h-full object-contain" 
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-0 md:-left-12" />
      <CarouselNext className="right-0 md:-right-12" />
    </Carousel>
  );
};

export default StoreCarousel;
