import * as React from 'react';
import { createPortal } from 'react-dom';

export interface PortalProps {
  /** Portal에 렌더링할 자식 요소 */
  children: React.ReactNode;
  /** Portal을 마운트할 컨테이너 (기본값: document.body) */
  container?: Element | null;
}

/**
 * Portal 컴포넌트
 *
 * 자식 요소를 DOM 트리의 다른 위치(기본: body)에 렌더링합니다.
 * 모달, 드롭다운, 토스트 등 오버레이 컴포넌트에 사용됩니다.
 *
 * @example
 * ```tsx
 * <Portal>
 *   <div className="modal">모달 내용</div>
 * </Portal>
 * ```
 */
export function Portal({ children, container }: PortalProps): React.ReactPortal | null {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) {
    return null;
  }

  const mountNode = container ?? document.body;
  return createPortal(children, mountNode);
}

Portal.displayName = 'Portal';
