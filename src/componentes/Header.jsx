function Header({ titulo, subtitulo }) {
    return (
        <header className="header">
            <div className="logo">
                <h1>{titulo}</h1>
                <p>{subtitulo}</p>
            </div>
        </header>
    );
}

export default Header;