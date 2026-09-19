/*
 * icons.jsx
 * ---------
 * Ícones SVG da interface (traço, 24x24, herdam currentColor) e as marcas
 * dos marketplaces. Substitui os emojis que a interface usava antes.
 *
 * Marcas: Mercado Livre, Magalu, Shein e Shopee usam os logos oficiais em
 * imagem (src/marketplace/assets). A Amazon segue com o desenho vetorial do
 * simple-icons (CC0), que herda a cor do contexto.
 */

import logoMercadoLivre from "../assets/mercadolivre.png";
import logoMagalu from "../assets/magalu.png";
import logoShein from "../assets/shein.png";
import logoShopee from "../assets/shopee.png";

function Icon({ children, size = 18, ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/* ---------- ícones de interface ---------- */

export const IconTarget = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" /></Icon>
);

export const IconCalculator = (p) => (
  <Icon {...p}>
    <rect x="4" y="2.5" width="16" height="19" rx="2.5" />
    <path d="M8 6.5h8M8 11h.01M12 11h.01M16 11h.01M8 14.5h.01M12 14.5h.01M16 14.5h.01M8 18h.01M12 18h.01M16 18h4.01" />
  </Icon>
);

export const IconPackage = (p) => (
  <Icon {...p}>
    <path d="M21 8.5v7a2 2 0 0 1-1 1.73l-7 3.9a2 2 0 0 1-2 0l-7-3.9A2 2 0 0 1 3 15.5v-7a2 2 0 0 1 1-1.73l7-3.9a2 2 0 0 1 2 0l7 3.9A2 2 0 0 1 21 8.5Z" />
    <path d="m3.3 7.4 8.7 4.8 8.7-4.8M12 21.5v-9.3" />
  </Icon>
);

export const IconTag = (p) => (
  <Icon {...p}>
    <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.83 0l-7.2-7.2A2 2 0 0 1 2.8 12V4.8A2 2 0 0 1 4.8 2.8H12a2 2 0 0 1 1.4.58l7.2 7.2a2 2 0 0 1 0 2.82Z" />
    <path d="M7.5 7.5h.01" />
  </Icon>
);

export const IconCoins = (p) => (
  <Icon {...p}>
    <circle cx="9" cy="9" r="6" /><path d="M15.5 5.2a6 6 0 0 1 0 13.6M12.5 21a6 6 0 0 1-5.9-5" />
  </Icon>
);

export const IconStore = (p) => (
  <Icon {...p}>
    <path d="M3.5 9.5V20a1 1 0 0 0 1 1h15a1 1 0 0 0 1-1V9.5" />
    <path d="M2.5 9.5 4.2 4.2a1.5 1.5 0 0 1 1.43-1.05h12.74A1.5 1.5 0 0 1 19.8 4.2l1.7 5.3a3 3 0 0 1-5.66 1.5 3 3 0 0 1-5.66 0 3 3 0 0 1-5.66-1.5Z" />
    <path d="M9.5 21v-5.5h5V21" />
  </Icon>
);

export const IconSliders = (p) => (
  <Icon {...p}>
    <path d="M5 21v-7M5 10V3M12 21v-10M12 7V3M19 21v-4M19 13V3M2.5 14h5M9.5 7h5M16.5 17h5" />
  </Icon>
);

export const IconTrophy = (p) => (
  <Icon {...p}>
    <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
    <path d="M7 5.5H4.5A1.5 1.5 0 0 0 3 7a4 4 0 0 0 4 4M17 5.5h2.5A1.5 1.5 0 0 1 21 7a4 4 0 0 1-4 4" />
    <path d="M9.5 20.5h5M12 14v6.5" />
  </Icon>
);

export const IconAlert = (p) => (
  <Icon {...p}><path d="M10.6 3.9 2.4 18a1.6 1.6 0 0 0 1.4 2.4h16.4a1.6 1.6 0 0 0 1.4-2.4L13.4 3.9a1.6 1.6 0 0 0-2.8 0Z" /><path d="M12 9.5v4.2M12 17.3h.01" /></Icon>
);

export const IconChart = (p) => (
  <Icon {...p}><path d="M3 3v16.5A1.5 1.5 0 0 0 4.5 21H21" /><path d="m7 15 3.5-4 3 2.5L19 7" /></Icon>
);

export const IconInstagram = (p) => (
  <Icon {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <path d="M17.2 6.8h.01" />
  </Icon>
);

export const IconArrowRight = (p) => (
  <Icon {...p}><path d="M4.5 12h15M13.5 6l6 6-6 6" /></Icon>
);

export const IconCrown = (p) => (
  <Icon {...p}><path d="M3 7.5 6.5 11 12 4.5 17.5 11 21 7.5V17a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17V7.5Z" /></Icon>
);

export const IconSparkles = (p) => (
  <Icon {...p}>
    <path d="M12 3.2c.7 4.6 3.5 7.4 8.1 8.1-4.6.7-7.4 3.5-8.1 8.1-.7-4.6-3.5-7.4-8.1-8.1 4.6-.7 7.4-3.5 8.1-8.1Z" />
    <path d="M18.5 2.5v3M20 4h-3" />
  </Icon>
);

export const IconTrendUp = (p) => (
  <Icon {...p}><path d="m3.5 16.5 5.5-5.5 3.5 3.5 7-7" /><path d="M15 7.5h4.5V12" /></Icon>
);

export const IconTrendDown = (p) => (
  <Icon {...p}><path d="m3.5 7.5 5.5 5.5 3.5-3.5 7 7" /><path d="M15 16.5h4.5V12" /></Icon>
);

export const IconGlobe = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M3.2 9.5h17.6M3.2 14.5h17.6" /><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" /></Icon>
);

export const IconBulb = (p) => (
  <Icon {...p}><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.5 10.9c.4.3.6.8.6 1.3V16h5.8v-.8c0-.5.2-1 .6-1.3A6 6 0 0 0 12 3Z" /></Icon>
);

export const IconPercent = (p) => (
  <Icon {...p}><path d="m5.5 18.5 13-13" /><circle cx="7.5" cy="7.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" /></Icon>
);

export const IconWeight = (p) => (
  <Icon {...p}><path d="M6.2 8h11.6l2 12.5a1 1 0 0 1-1 1.2H5.2a1 1 0 0 1-1-1.2L6.2 8Z" /><circle cx="12" cy="5" r="2.5" /></Icon>
);

export const IconRuler = (p) => (
  <Icon {...p}><rect x="2.5" y="8" width="19" height="8" rx="1.5" /><path d="M7 8v3M11 8v4M15 8v3M19 8v4" /></Icon>
);

export const IconEraser = (p) => (
  <Icon {...p}><path d="m8.5 20.5-5-5a1.5 1.5 0 0 1 0-2.1l9-9a1.5 1.5 0 0 1 2.1 0l5.5 5.5a1.5 1.5 0 0 1 0 2.1l-9.4 9.4a1.5 1.5 0 0 1-1 .4H4" /><path d="m9 9 6.5 6.5" /></Icon>
);

export const IconLayers = (p) => (
  <Icon {...p}><path d="m12 3 9 4.5-9 4.5-9-4.5L12 3Z" /><path d="m3 12.5 9 4.5 9-4.5M3 17l9 4.5 9-4.5" /></Icon>
);

/* ---------- marcas dos marketplaces ---------- */

// Desenhos oficiais (simple-icons, CC0 1.0). viewBox 24x24, preenchidos.
const OFICIAIS = {
  amazon:
    "M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726a17.617 17.617 0 01-10.951-.577 17.88 17.88 0 01-5.43-3.35c-.1-.074-.151-.15-.151-.22 0-.047.021-.09.051-.13zm6.565-6.218c0-1.005.247-1.863.743-2.577.495-.71 1.17-1.25 2.04-1.615.796-.335 1.756-.575 2.912-.72.39-.046 1.033-.103 1.92-.174v-.37c0-.93-.105-1.558-.3-1.875-.302-.43-.78-.65-1.44-.65h-.182c-.48.046-.896.196-1.246.46-.35.27-.575.63-.675 1.096-.06.3-.206.465-.435.51l-2.52-.315c-.248-.06-.372-.18-.372-.39 0-.046.007-.09.022-.15.247-1.29.855-2.25 1.82-2.88.976-.616 2.1-.975 3.39-1.05h.54c1.65 0 2.957.434 3.888 1.29.135.15.27.3.405.48.12.165.224.314.283.45.075.134.15.33.195.57.06.254.105.42.135.51.03.104.062.3.076.615.01.313.02.493.02.553v5.28c0 .376.06.72.165 1.036.105.313.21.54.315.674l.51.674c.09.136.136.256.136.36 0 .12-.06.226-.18.314-1.2 1.05-1.86 1.62-1.963 1.71-.165.135-.375.15-.63.045a6.062 6.062 0 01-.526-.496l-.31-.347a9.391 9.391 0 01-.317-.42l-.3-.435c-.81.886-1.603 1.44-2.4 1.665-.494.15-1.093.227-1.83.227-1.11 0-2.04-.343-2.76-1.034-.72-.69-1.08-1.665-1.08-2.94l-.05-.076zm3.753-.438c0 .566.14 1.02.425 1.364.285.34.675.512 1.155.512.045 0 .106-.007.195-.02.09-.016.134-.023.166-.023.614-.16 1.08-.553 1.424-1.178.165-.28.285-.58.36-.91.09-.32.12-.59.135-.8.015-.195.015-.54.015-1.005v-.54c-.84 0-1.484.06-1.92.18-1.275.36-1.92 1.17-1.92 2.43l-.035-.02zm9.162 7.027c.03-.06.075-.11.132-.17.362-.243.714-.41 1.05-.5a8.094 8.094 0 011.612-.24c.14-.012.28 0 .41.03.65.06 1.05.168 1.172.33.063.09.099.228.099.39v.15c0 .51-.149 1.11-.424 1.8-.278.69-.664 1.248-1.156 1.68-.073.06-.14.09-.197.09-.03 0-.06 0-.09-.012-.09-.044-.107-.12-.064-.24.54-1.26.806-2.143.806-2.64 0-.15-.03-.27-.087-.344-.145-.166-.55-.257-1.224-.257-.243 0-.533.016-.87.046-.363.045-.7.09-1 .135-.09 0-.148-.014-.18-.044-.03-.03-.036-.047-.02-.077 0-.017.006-.03.02-.063v-.06z",
  shopee:
    "M15.9414 17.9633c.229-1.879-.981-3.077-4.1758-4.0969-1.548-.528-2.277-1.22-2.26-2.1719.065-1.056 1.048-1.825 2.352-1.85a5.2898 5.2898 0 0 1 2.8838.89c.116.072.197.06.263-.039.09-.145.315-.494.39-.62.051-.081.061-.187-.068-.281-.185-.1369-.704-.4149-.983-.5319a6.4697 6.4697 0 0 0-2.5118-.514c-1.909.008-3.4129 1.215-3.5389 2.826-.082 1.1629.494 2.1078 1.73 2.8278.262.152 1.6799.716 2.2438.892 1.774.552 2.695 1.5419 2.478 2.6969-.197 1.047-1.299 1.7239-2.818 1.7439-1.2039-.046-2.2878-.537-3.1278-1.19l-.141-.11c-.104-.08-.218-.075-.287.03-.05.077-.376.547-.458.67-.077.108-.035.168.045.234.35.293.817.613 1.134.775a6.7097 6.7097 0 0 0 2.8289.727 4.9048 4.9048 0 0 0 2.0759-.354c1.095-.465 1.8029-1.394 1.9449-2.554zM11.9986 1.4009c-2.068 0-3.7539 1.95-3.8329 4.3899h7.6657c-.08-2.44-1.765-4.3899-3.8328-4.3899zm7.8516 22.5981-.08.001-15.7843-.002c-1.074-.04-1.863-.91-1.971-1.991l-.01-.195L1.298 6.2858a.459.459 0 0 1 .45-.494h4.9748C6.8448 2.568 9.1607 0 11.9996 0c2.8388 0 5.1537 2.5689 5.2757 5.7898h4.9678a.459.459 0 0 1 .458.483l-.773 15.5883-.007.131c-.094 1.094-.979 1.9769-2.0709 2.0059z",
};

// Logos oficiais em imagem. Proporções diferentes entre si — por isso o
// object-fit: contain, que encaixa cada uma na caixa sem distorcer.
const LOGOS = {
  mercadolivre: logoMercadoLivre,
  magalu: logoMagalu,
  shein: logoShein,
  shopee: logoShopee,
};

// Reserva: se algum dia entrar um marketplace sem logo nem vetor.
const MONOGRAMAS = { mercadolivre: "ML", magalu: "M", shein: "S" };

/**
 * Marca do marketplace, dimensionada pelo container.
 * Herda a cor via CSS (`color`), então o chamador controla o tom.
 */
export function MarketplaceMark({ id, size = 16 }) {
  const logo = LOGOS[id];
  if (logo) {
    return (
      <img
        src={logo}
        alt=""
        aria-hidden="true"
        className="mp-logo"
        style={{ width: size, height: size }}
        loading="lazy"
        decoding="async"
      />
    );
  }

  const d = OFICIAIS[id];
  if (d) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" focusable="false">
        <path d={d} />
      </svg>
    );
  }
  return (
    <span className="mp-monogram" style={{ fontSize: Math.round(size * 0.62) }} aria-hidden="true">
      {MONOGRAMAS[id] || "?"}
    </span>
  );
}
