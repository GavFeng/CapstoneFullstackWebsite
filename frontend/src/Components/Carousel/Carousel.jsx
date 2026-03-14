import { useRef, useState, useEffect } from "react";
import "./Carousel.css";

const Carousel = ({ title, items, ItemComponent }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  const updateOverflowState = () => {
    const el = scrollRef.current;
    if (!el) return;

    const isOverflowing = el.scrollWidth > el.clientWidth + 1;
    el.classList.toggle("overflowing", !isOverflowing);
    checkScroll();
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateOverflowState();

    const handleResize = () => updateOverflowState();
    window.addEventListener("resize", handleResize);
    el.addEventListener("scroll", checkScroll);

    // Also re-check after a short delay (images/fonts might load late)
    const timer = setTimeout(updateOverflowState, 300);

    return () => {
      window.removeEventListener("resize", handleResize);
      el.removeEventListener("scroll", checkScroll);
      clearTimeout(timer);
    };
  }, [items]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;

    const itemWidthApprox = 320 + 24;
    const offset = direction === "left" ? -itemWidthApprox : itemWidthApprox;

    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="carousel-container">
      {title && (
        <div className="carousel-header">
          <h2 className="carousel-title">{title}</h2>
          <div className="carousel-underline"></div>
        </div>
      )}

      <div className="carousel-wrapper">
        {canScrollLeft && (
          <button
            className="carousel-arrow carousel-arrow-left"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
          >
            ‹
          </button>
        )}

        <div ref={scrollRef} className="carousel-scroll">
          {items.map((item) => (
            <div key={item._id || item.id} className="carousel-item-wrapper">
              <ItemComponent {...item} />
            </div>
          ))}
        </div>

        {canScrollRight && (
          <button
            className="carousel-arrow carousel-arrow-right"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
          >
            ›
          </button>
        )}
      </div>
    </div>
  )
}

export default Carousel