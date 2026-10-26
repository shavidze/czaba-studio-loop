import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

// Constants for animation timing
// მანიფესტი: ელეგანტური, არა ზედმეტად სწრაფი ანიმაციები
const GROW_DURATION = 1.6; // კლავიშების გაზრდა
const HOLD_DURATION = 1000; // ლოგოს ჩვენება
const CRACK_DURATION = 600; // ბზარების გაჩენა
const FALL_DURATION = 2.2; // ნატეხების ვარდნა

// ანიმაციის ინტერვალი (5-7 საათი)
const MIN_INTERVAL = 5 * 60 * 60 * 1000;
const MAX_INTERVAL = 7 * 60 * 60 * 1000;
const STORAGE_KEY = 'czaba_piano_last_shown';

function shouldShowAnimation(): boolean {
  if (typeof window === 'undefined') return false;
  const lastShown = localStorage.getItem(STORAGE_KEY);
  if (!lastShown) return true;
  const lastShownTime = parseInt(lastShown, 10);
  const randomInterval = MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
  return Date.now() - lastShownTime >= randomInterval;
}

function markAnimationShown(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, Date.now().toString());
}

// თითოეული კლავიში იმსხვრევა 3-4 ნატეხად
// მანიფესტი: რეალისტური მსხვრევა, არა უბრალო 2 ნაწილად გაყოფა
interface KeyPiece {
  clipPath: string; // პოლიგონის ფორმა
  fallX: number;
  fallY: number;
  rotation: number;
  delay: number;
  scale: number;
}

// შემთხვევითი მსხვრევის პატერნის გენერაცია
function generateShatterPieces(keyIndex: number, totalKeys: number): KeyPiece[] {
  const centerOffset = (keyIndex - totalKeys / 2) / (totalKeys / 2);
  const pieces: KeyPiece[] = [];

  // 3-4 ნატეხი თითო კლავიშზე - არაწესიერი ფორმები
  const pieceCount = 3 + Math.floor(Math.random() * 2);

  // მსხვრევის წერტილები (შემთხვევითი)
  const breakPointY = 30 + Math.random() * 40; // 30-70%
  const breakPointX = 20 + Math.random() * 60; // 20-80%

  // ზედა მარცხენა ნატეხი
  pieces.push({
    clipPath: `polygon(0 0, ${breakPointX}% 0, ${breakPointX * 0.7}% ${breakPointY}%, 0 ${breakPointY * 1.2}%)`,
    fallX: centerOffset * 150 - 80 + Math.random() * 40,
    fallY: 400 + Math.random() * 300,
    rotation: -15 - Math.random() * 20,
    delay: Math.random() * 0.15,
    scale: 0.95 + Math.random() * 0.1,
  });

  // ზედა მარჯვენა ნატეხი
  pieces.push({
    clipPath: `polygon(${breakPointX}% 0, 100% 0, 100% ${breakPointY * 0.8}%, ${breakPointX * 1.1}% ${breakPointY}%)`,
    fallX: centerOffset * 150 + 60 + Math.random() * 50,
    fallY: 350 + Math.random() * 250,
    rotation: 10 + Math.random() * 25,
    delay: Math.random() * 0.2,
    scale: 0.9 + Math.random() * 0.15,
  });

  // ქვედა დიდი ნატეხი
  pieces.push({
    clipPath: `polygon(0 ${breakPointY * 1.2}%, ${breakPointX * 0.7}% ${breakPointY}%, ${breakPointX * 1.1}% ${breakPointY}%, 100% ${breakPointY * 0.8}%, 100% 100%, 0 100%)`,
    fallX: centerOffset * 200 + (Math.random() - 0.5) * 60,
    fallY: 500 + Math.random() * 400,
    rotation: centerOffset * 15 + (Math.random() - 0.5) * 10,
    delay: 0.1 + Math.random() * 0.15,
    scale: 1,
  });

  // დამატებითი პატარა ნატეხი (50% შანსი)
  if (pieceCount > 3) {
    pieces.push({
      clipPath: `polygon(${breakPointX * 0.5}% ${breakPointY * 0.5}%, ${breakPointX}% ${breakPointY * 0.3}%, ${breakPointX * 0.8}% ${breakPointY}%)`,
      fallX: centerOffset * 100 + (Math.random() - 0.5) * 100,
      fallY: 300 + Math.random() * 200,
      rotation: 30 + Math.random() * 60,
      delay: Math.random() * 0.1,
      scale: 0.8,
    });
  }

  return pieces;
}

type Phase = 'growing' | 'holding' | 'cracking' | 'falling' | 'done';

export function PianoCurtainLoader() {
  const [shouldShow, setShouldShow] = useState(false);
  const [phase, setPhase] = useState<Phase>('growing');

  // მანიფესტი: ნაკლები კლავიში, უფრო განიერი - პრემიუმ იერსახე
  // 9 თეთრი კლავიში (1 ოქტავა + 2) ნაცვლად 21-ისა
  const whiteKeyCount = 9;
  const whiteKeys = Array.from({ length: whiteKeyCount });

  // შავი კლავიშები: C#, D#, F#, G#, A# (5 ცალი)
  const blackKeyPositions = [0, 1, 3, 4, 5]; // პოზიციები თეთრ კლავიშებთან მიმართებაში

  // მსხვრევის ნატეხები - useMemo სტაბილურობისთვის
  const whiteKeyPieces = useMemo(
    () => whiteKeys.map((_, i) => generateShatterPieces(i, whiteKeyCount)),
    [whiteKeys.map],
  );

  const blackKeyPieces = useMemo(
    () => blackKeyPositions.map((_, i) => generateShatterPieces(i, blackKeyPositions.length)),
    [],
  );

  useEffect(() => {
    const show = shouldShowAnimation();
    setShouldShow(show);
    if (show) markAnimationShown();
  }, []);

  useEffect(() => {
    if (!shouldShow) return;

    const timers: NodeJS.Timeout[] = [];
    let elapsed = GROW_DURATION * 1000;

    timers.push(setTimeout(() => setPhase('holding'), elapsed));
    elapsed += HOLD_DURATION;

    timers.push(setTimeout(() => setPhase('cracking'), elapsed));
    elapsed += CRACK_DURATION;

    timers.push(setTimeout(() => setPhase('falling'), elapsed));
    elapsed += FALL_DURATION * 1000;

    timers.push(setTimeout(() => setPhase('done'), elapsed));

    return () => timers.forEach(clearTimeout);
  }, [shouldShow]);

  if (!shouldShow || phase === 'done') return null;

  const isCracking = phase === 'cracking';
  const isFalling = phase === 'falling';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: isFalling ? 0 : 1 }}
        transition={{ duration: 0.8, delay: isFalling ? FALL_DURATION - 0.8 : 0 }}
        className="fixed inset-0 z-50"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        {/* თეთრი კლავიშები - განიერი, პრემიუმ */}
        <div className="relative flex w-full h-full">
          {whiteKeys.map((_, keyIndex) => {
            const pieces = whiteKeyPieces[keyIndex];

            return (
              <div key={`white-${keyIndex}`} className="flex-1 relative overflow-visible">
                {isFalling ? (
                  // მსხვრევის ნატეხები - clipPath-ით
                  pieces.map((piece, pieceIndex) => (
                    <motion.div
                      key={`white-${keyIndex}-piece-${pieceIndex}`}
                      initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
                      animate={{
                        x: piece.fallX,
                        y: piece.fallY,
                        rotate: piece.rotation,
                        opacity: 0,
                        scale: piece.scale,
                      }}
                      transition={{
                        duration: FALL_DURATION,
                        delay: piece.delay,
                        ease: [0.33, 0, 0.67, 1], // გრავიტაციის მსგავსი
                      }}
                      className="absolute inset-0"
                      style={{
                        clipPath: piece.clipPath,
                        backgroundColor: 'white',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                        borderRight: '1px solid var(--color-outline)',
                      }}
                    />
                  ))
                ) : (
                  // მთლიანი კლავიში + ბზარი
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: '100%' }}
                    transition={{
                      duration: GROW_DURATION,
                      delay: keyIndex * 0.06, // უფრო ნელი ტალღა
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    className="absolute inset-0 border-r origin-top"
                    style={{
                      borderColor: 'var(--color-outline)',
                      backgroundColor: 'white',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                    }}
                  >
                    {/* ბზარის ხაზები */}
                    {isCracking && (
                      <>
                        <motion.div
                          initial={{ scaleX: 0, opacity: 0 }}
                          animate={{ scaleX: 1, opacity: 0.6 }}
                          transition={{ duration: 0.3, delay: keyIndex * 0.03 }}
                          className="absolute h-[1px]"
                          style={{
                            top: '35%',
                            left: '10%',
                            right: '20%',
                            background: 'linear-gradient(90deg, rgba(0,0,0,0.5), rgba(0,0,0,0.2))',
                            transformOrigin: 'left',
                          }}
                        />
                        <motion.div
                          initial={{ scaleY: 0, opacity: 0 }}
                          animate={{ scaleY: 1, opacity: 0.4 }}
                          transition={{ duration: 0.25, delay: keyIndex * 0.03 + 0.1 }}
                          className="absolute w-[1px]"
                          style={{
                            top: '35%',
                            left: '45%',
                            height: '30%',
                            background: 'linear-gradient(180deg, rgba(0,0,0,0.4), transparent)',
                            transformOrigin: 'top',
                          }}
                        />
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* შავი კლავიშები */}
        <div className="absolute inset-0 pointer-events-none">
          {blackKeyPositions.map((position, keyIndex) => {
            // 9 თეთრ კლავიშზე გაანგარიშება
            const leftPosition = ((position + 0.65) / whiteKeyCount) * 100;
            const pieces = blackKeyPieces[keyIndex];

            return (
              <div
                key={`black-${keyIndex}`}
                className="absolute overflow-visible"
                style={{
                  left: `${leftPosition}%`,
                  width: `${(100 / whiteKeyCount) * 0.55}%`, // განიერი შავი კლავიშები
                  height: '58%',
                  zIndex: 10,
                }}
              >
                {isFalling ? (
                  pieces.map((piece, pieceIndex) => (
                    <motion.div
                      key={`black-${keyIndex}-piece-${pieceIndex}`}
                      initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
                      animate={{
                        x: piece.fallX * 0.6,
                        y: piece.fallY * 0.5,
                        rotate: piece.rotation * 1.2,
                        opacity: 0,
                        scale: piece.scale,
                      }}
                      transition={{
                        duration: FALL_DURATION,
                        delay: piece.delay + 0.08,
                        ease: [0.33, 0, 0.67, 1],
                      }}
                      className="absolute inset-0"
                      style={{
                        clipPath: piece.clipPath,
                        backgroundColor: 'var(--color-elevated)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                      }}
                    />
                  ))
                ) : (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: '100%' }}
                    transition={{
                      duration: GROW_DURATION,
                      delay: position * 0.06 + 0.03,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    className="absolute inset-0 origin-top rounded-b-sm"
                    style={{
                      backgroundColor: 'var(--color-elevated)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.45)',
                    }}
                  >
                    {isCracking && (
                      <motion.div
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 0.5 }}
                        transition={{ duration: 0.25, delay: keyIndex * 0.04 }}
                        className="absolute left-[15%] right-[15%] h-[1px]"
                        style={{
                          top: '40%',
                          background: 'rgba(255,255,255,0.4)',
                          transformOrigin: 'left',
                        }}
                      />
                    )}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* CZABA Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={
            isFalling
              ? {
                  opacity: 0,
                  y: -100,
                  scale: 1.1,
                }
              : {
                  opacity: phase === 'growing' ? 0 : 1,
                  y: 0,
                  scale: 1,
                }
          }
          transition={{
            duration: isFalling ? 1 : 0.6,
            delay: isFalling ? 0 : 0.3,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl md:text-7xl font-bold z-20 tracking-wider"
          style={{
            color: 'var(--color-brand)',
            textShadow: '0 4px 30px rgba(0,0,0,0.3)',
          }}
        >
          CZABA
        </motion.div>

        {/* Subtle dust particles when falling */}
        {isFalling && (
          <div className="absolute inset-0 pointer-events-none z-30">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={`dust-${i}`}
                initial={{
                  opacity: 0.6,
                  x: `${10 + i * 4}%`,
                  y: '50%',
                  scale: 1,
                }}
                animate={{
                  opacity: 0,
                  y: '120%',
                  scale: 0.5,
                }}
                transition={{
                  duration: FALL_DURATION * 0.8,
                  delay: 0.2 + i * 0.05,
                  ease: [0.45, 0, 0.55, 1],
                }}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.8)',
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
