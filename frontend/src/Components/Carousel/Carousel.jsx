import { useRef, useState, useEffect } from "react";
import "./Carousel.css";

{/* Carousel Compontent for Displaying Jigs */}
const Carousel = ({ title, items, ItemComponent }) => {

  /* ---------- STATE ---------- */

  // horizontal scroll ref
  const scrollRef = useRef(null);

  // Controls if left/right carousel arrows are visible
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);


  /* ---------- EFFECTS ---------- */

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Initial check if enough items to overflow
    updateOverflowState();

    // Recalculate when window resizes
    const handleResize = () => updateOverflowState();
    window.addEventListener("resize", handleResize);

    // Track scroll position to mange scroll dynamically
    el.addEventListener("scroll", checkScroll);

    // Delay re-check for loading
    const timer = setTimeout(updateOverflowState, 300);

    return () => {
      window.removeEventListener("resize", handleResize);
      el.removeEventListener("scroll", checkScroll);
      clearTimeout(timer);
    };
  }, [items]);


  /* ---------- HELPERS ---------- */

  // Determines if user can scroll left/right based on current position
  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(
      el.scrollLeft + el.clientWidth < el.scrollWidth - 1
    );
  };

  // Checks if content overflows container
  const updateOverflowState = () => {
    const el = scrollRef.current;
    if (!el) return;

    const isOverflowing = el.scrollWidth > el.clientWidth + 1;

    // Different class for styling when NOT overflow
    el.classList.toggle("overflowing", !isOverflowing);

    checkScroll();
  };


  /* ---------- HANDLERS ---------- */

  // Scrolls carousel around one item length
  const handleScroll = (direction) => {
    if (!scrollRef.current) return;

    // Approx width of one item + gap 
    const itemWidthApprox = 320 + 24;

    const offset =
      direction === "left" ? -itemWidthApprox : itemWidthApprox;

    scrollRef.current.scrollBy({
      left: offset,
      behavior: "smooth",
    });
  };


  /* ---------- JSX ---------- */

  // Do not render carousel if there are no items
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
        {/* Left arrow (If scrollable)*/}
        {canScrollLeft && (
          <button
            className="carousel-arrow carousel-arrow-left"
            onClick={() => handleScroll("left")}
            aria-label="Scroll left"
          >
            ‹
          </button>
        )}

        {/* Scrollable content container */}
        <div ref={scrollRef} className="carousel-scroll">
          {items.map((item) => (
            <div
              key={item._id || item.id}
              className="carousel-item-wrapper"
            >
              <ItemComponent {...item} />
            </div>
          ))}
        </div>

        {/* Right arrow (If scrollable) */}
        {canScrollRight && (
          <button
            className="carousel-arrow carousel-arrow-right"
            onClick={() => handleScroll("right")}
            aria-label="Scroll right"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}

export default Carousel