
type InputNode = HTMLInputElement | null;
type AnimationEndCallback = (placeholder: string, inputNode: InputNode) => void;


export const PLACEHOLDERS: string[] = [
  'This is an animated placeholder',
  'Search for a green hoodie',
  'Search for our latest item',
  'Find your favorite movie'
];


export const getRandomDelayBetween = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1) + min);


export const setPlaceholder = (inputNode: InputNode, placeholder: string): void => {
  if (inputNode) {
    inputNode.setAttribute("placeholder", placeholder);
  }
};

export const animateLetters = (
  currentLetters: string[],
  remainingLetters: string[],
  inputNode: InputNode,
  onAnimationEnd: AnimationEndCallback
): void => {
  if (!remainingLetters.length) {
    if (typeof onAnimationEnd === 'function') {
      onAnimationEnd(currentLetters.join(''), inputNode);
    }
    return; 
  }

  currentLetters.push(remainingLetters.shift() || '');

  setTimeout(() => {
    setPlaceholder(inputNode, currentLetters.join(''));
    animateLetters(currentLetters, remainingLetters, inputNode, onAnimationEnd);
  }, getRandomDelayBetween(50, 90));
};


export const animatePlaceholder = (
  inputNode: InputNode,
  placeholder: string,
  onAnimationEnd: AnimationEndCallback
): void => {
  animateLetters([], placeholder.split(''), inputNode, onAnimationEnd);
};


export const onAnimationEnd = (placeholder: string, inputNode: InputNode): void => {
  setTimeout(() => {
    let newPlaceholder = '';

    do {
      newPlaceholder = PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)];
    } while (placeholder === newPlaceholder);

    animatePlaceholder(inputNode, newPlaceholder, onAnimationEnd);
  }, 1000); 
};
