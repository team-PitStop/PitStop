// AuthScene.jsx
// Purely decorative backdrop for the Login and Register pages: a calm
// Mediterranean coast drawn entirely in CSS (see the "Auth pages" block
// in index.css). Every element here is presentational — the whole tree
// is aria-hidden and contains no text, controls, or behaviour.
//
// It exists as a component only so the two auth pages share one copy of
// the markup instead of duplicating it.

function AuthScene() {
  return (
    <div className="auth-scene" aria-hidden="true">
      <span className="scene-sea" />
      <span className="scene-headland" />
      <span className="scene-village" />
      {/* road, trees and car are nested so the land clips them — the
          road's arc would otherwise run out over the sea at the edges */}
      <span className="scene-land">
        <span className="scene-road" />
        <span className="scene-trees" />
        <span className="scene-car" />
      </span>
    </div>
  );
}

export default AuthScene;
