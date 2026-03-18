import { NextResponse } from 'next/server'

interface VlessConfig {
  id: string
  link: string
  country: string
  flag: string
  hostname: string
  port: string
  uuid: string
}

// สุ่มธงสำหรับ Unknown
const RANDOM_FLAGS = [
  { country: 'Germany', flag: '🇩🇪' },
  { country: 'France', flag: '🇫🇷' },
  { country: 'United Kingdom', flag: '🇬🇧' },
  { country: 'Netherlands', flag: '🇳🇱' },
  { country: 'United States', flag: '🇺🇸' },
  { country: 'Singapore', flag: '🇸🇬' },
  { country: 'Japan', flag: '🇯🇵' },
  { country: 'South Korea', flag: '🇰🇷' },
  { country: 'Hong Kong', flag: '🇭🇰' },
  { country: 'Taiwan', flag: '🇹🇼' },
  { country: 'Thailand', flag: '🇹🇭' },
  { country: 'Vietnam', flag: '🇻🇳' },
  { country: 'Malaysia', flag: '🇲🇾' },
  { country: 'Indonesia', flag: '🇮🇩' },
  { country: 'Philippines', flag: '🇵🇭' },
  { country: 'India', flag: '🇮🇳' },
  { country: 'Australia', flag: '🇦🇺' },
  { country: 'Canada', flag: '🇨🇦' },
  { country: 'Brazil', flag: '🇧🇷' },
  { country: 'Turkey', flag: '🇹🇷' },
  { country: 'Russia', flag: '🇷🇺' },
  { country: 'Poland', flag: '🇵🇱' },
  { country: 'Sweden', flag: '🇸🇪' },
  { country: 'Norway', flag: '🇳🇴' },
  { country: 'Finland', flag: '🇫🇮' },
  { country: 'Denmark', flag: '🇩🇰' },
  { country: 'Italy', flag: '🇮🇹' },
  { country: 'Spain', flag: '🇪🇸' },
  { country: 'Switzerland', flag: '🇨🇭' },
  { country: 'Austria', flag: '🇦🇹' },
  { country: 'Belgium', flag: '🇧🇪' },
  { country: 'Ireland', flag: '🇮🇪' },
  { country: 'Portugal', flag: '🇵🇹' },
  { country: 'Greece', flag: '🇬🇷' },
  { country: 'Czech Republic', flag: '🇨🇿' },
  { country: 'Romania', flag: '🇷🇴' },
  { country: 'Hungary', flag: '🇭🇺' },
  { country: 'Ukraine', flag: '🇺🇦' },
  { country: 'Bulgaria', flag: '🇧🇬' },
  { country: 'Croatia', flag: '🇭🇷' },
  { country: 'Serbia', flag: '🇷🇸' },
  { country: 'UAE', flag: '🇦🇪' },
  { country: 'Saudi Arabia', flag: '🇸🇦' },
  { country: 'Israel', flag: '🇮🇱' },
  { country: 'South Africa', flag: '🇿🇦' },
  { country: 'Egypt', flag: '🇪🇬' },
  { country: 'Mexico', flag: '🇲🇽' },
  { country: 'Argentina', flag: '🇦🇷' },
  { country: 'Chile', flag: '🇨🇱' },
  { country: 'Colombia', flag: '🇨🇴' },
  { country: 'Peru', flag: '🇵🇪' },
  { country: 'New Zealand', flag: '🇳🇿' },
  { country: 'China', flag: '🇨🇳' },
  { country: 'Pakistan', flag: '🇵🇰' },
  { country: 'Bangladesh', flag: '🇧🇩' },
  { country: 'Sri Lanka', flag: '🇱🇰' },
  { country: 'Nepal', flag: '🇳🇵' },
  { country: 'Myanmar', flag: '🇲🇲' },
  { country: 'Cambodia', flag: '🇰🇭' },
  { country: 'Laos', flag: '🇱🇦' },
  { country: 'Brunei', flag: '🇧🇳' },
  { country: 'Mongolia', flag: '🇲🇳' },
  { country: 'Kazakhstan', flag: '🇰🇿' },
  { country: 'Uzbekistan', flag: '🇺🇿' },
  { country: 'Azerbaijan', flag: '🇦🇿' },
  { country: 'Georgia', flag: '🇬🇪' },
  { country: 'Armenia', flag: '🇦🇲' },
  { country: 'Belarus', flag: '🇧🇾' },
  { country: 'Moldova', flag: '🇲🇩' },
  { country: 'Slovakia', flag: '🇸🇰' },
  { country: 'Slovenia', flag: '🇸🇮' },
  { country: 'Lithuania', flag: '🇱🇹' },
  { country: 'Latvia', flag: '🇱🇻' },
  { country: 'Estonia', flag: '🇪🇪' },
  { country: 'Iceland', flag: '🇮🇸' },
  { country: 'Luxembourg', flag: '🇱🇺' },
  { country: 'Malta', flag: '🇲🇹' },
  { country: 'Cyprus', flag: '🇨🇾' },
  { country: 'Albania', flag: '🇦🇱' },
  { country: 'Bosnia', flag: '🇧🇦' },
  { country: 'Montenegro', flag: '🇲🇪' },
  { country: 'North Macedonia', flag: '🇲🇰' },
  { country: 'Kosovo', flag: '🇽🇰' },
  { country: 'Qatar', flag: '🇶🇦' },
  { country: 'Kuwait', flag: '🇰🇼' },
  { country: 'Bahrain', flag: '🇧🇭' },
  { country: 'Oman', flag: '🇴🇲' },
  { country: 'Jordan', flag: '🇯🇴' },
  { country: 'Lebanon', flag: '🇱🇧' },
  { country: 'Iraq', flag: '🇮🇶' },
  { country: 'Iran', flag: '🇮🇷' },
  { country: 'Syria', flag: '🇸🇾' },
  { country: 'Yemen', flag: '🇾🇪' },
  { country: 'Afghanistan', flag: '🇦🇫' },
  { country: 'Turkmenistan', flag: '🇹🇲' },
  { country: 'Kyrgyzstan', flag: '🇰🇬' },
  { country: 'Tajikistan', flag: '🇹🇯' },
  { country: 'North Korea', flag: '🇰🇵' },
  { country: 'Macau', flag: '🇲🇴' },
  { country: 'Bhutan', flag: '🇧🇹' },
  { country: 'Maldives', flag: '🇲🇻' },
  { country: 'Papua New Guinea', flag: '🇵🇬' },
  { country: 'Fiji', flag: '🇫🇯' },
  { country: 'Solomon Islands', flag: '🇸🇧' },
  { country: 'Vanuatu', flag: '🇻🇺' },
  { country: 'Samoa', flag: '🇼🇸' },
  { country: 'Tonga', flag: '🇹🇴' },
  { country: 'Kiribati', flag: '🇰🇮' },
  { country: 'Tuvalu', flag: '🇹🇻' },
  { country: 'Nauru', flag: '🇳🇷' },
  { country: 'Palau', flag: '🇵🇼' },
  { country: 'Marshall Islands', flag: '🇲🇭' },
  { country: 'Micronesia', flag: '🇫🇲' },
  { country: 'Guam', flag: '🇬🇺' },
  { country: 'Northern Mariana Islands', flag: '🇲🇵' },
  { country: 'American Samoa', flag: '🇦🇸' },
  { country: 'Cook Islands', flag: '🇨🇰' },
  { country: 'Niue', flag: '🇳🇺' },
  { country: 'Tokelau', flag: '🇹🇰' },
  { country: 'Pitcairn', flag: '🇵🇳' },
  { country: 'French Polynesia', flag: '🇵🇫' },
  { country: 'New Caledonia', flag: '🇳🇨' },
  { country: 'Wallis and Futuna', flag: '🇼🇫' },
  { country: 'Norfolk Island', flag: '🇳🇫' },
  { country: 'Christmas Island', flag: '🇨🇽' },
  { country: 'Cocos Islands', flag: '🇨🇨' },
  { country: 'Nauru', flag: '🇳🇷' },
  { country: 'Morocco', flag: '🇲🇦' },
  { country: 'Algeria', flag: '🇩🇿' },
  { country: 'Tunisia', flag: '🇹🇳' },
  { country: 'Libya', flag: '🇱🇾' },
  { country: 'Sudan', flag: '🇸🇩' },
  { country: 'Ethiopia', flag: '🇪🇹' },
  { country: 'Somalia', flag: '🇸🇴' },
  { country: 'Kenya', flag: '🇰🇪' },
  { country: 'Uganda', flag: '🇺🇬' },
  { country: 'Tanzania', flag: '🇹🇿' },
  { country: 'Rwanda', flag: '🇷🇼' },
  { country: 'Burundi', flag: '🇧🇮' },
  { country: 'Djibouti', flag: '🇩🇯' },
  { country: 'Eritrea', flag: '🇪🇷' },
  { country: 'Chad', flag: '🇹🇩' },
  { country: 'Niger', flag: '🇳🇪' },
  { country: 'Mali', flag: '🇲🇱' },
  { country: 'Burkina Faso', flag: '🇧🇫' },
  { country: 'Mauritania', flag: '🇲🇷' },
  { country: 'Senegal', flag: '🇸🇳' },
  { country: 'Gambia', flag: '🇬🇲' },
  { country: 'Guinea', flag: '🇬🇳' },
  { country: 'Guinea-Bissau', flag: '🇬🇼' },
  { country: 'Sierra Leone', flag: '🇸🇱' },
  { country: 'Liberia', flag: '🇱🇷' },
  { country: 'Ivory Coast', flag: '🇨🇮' },
  { country: 'Ghana', flag: '🇬🇭' },
  { country: 'Togo', flag: '🇹🇬' },
  { country: 'Benin', flag: '🇧🇯' },
  { country: 'Nigeria', flag: '🇳🇬' },
  { country: 'Cameroon', flag: '🇨🇲' },
  { country: 'Central African Republic', flag: '🇨🇫' },
  { country: 'Equatorial Guinea', flag: '🇬🇶' },
  { country: 'Gabon', flag: '🇬🇦' },
  { country: 'Republic of the Congo', flag: '🇨🇬' },
  { country: 'Democratic Republic of the Congo', flag: '🇨🇩' },
  { country: 'Angola', flag: '🇦🇴' },
  { country: 'Zambia', flag: '🇿🇲' },
  { country: 'Zimbabwe', flag: '🇿🇼' },
  { country: 'Malawi', flag: '🇲🇼' },
  { country: 'Mozambique', flag: '🇲🇿' },
  { country: 'Botswana', flag: '🇧🇼' },
  { country: 'Namibia', flag: '🇳🇦' },
  { country: 'South Africa', flag: '🇿🇦' },
  { country: 'Lesotho', flag: '🇱🇸' },
  { country: 'Eswatini', flag: '🇸🇿' },
  { country: 'Madagascar', flag: '🇲🇬' },
  { country: 'Mauritius', flag: '🇲🇺' },
  { country: 'Seychelles', flag: '🇸🇨' },
  { country: 'Comoros', flag: '🇰🇲' },
  { country: 'Mayotte', flag: '🇾🇹' },
  { country: 'Reunion', flag: '🇷🇪' },
  { country: 'Saint Helena', flag: '🇸🇭' },
  { country: 'Ascension Island', flag: '🇦🇨' },
  { country: 'Tristan da Cunha', flag: '🇹🇦' },
  { country: 'Venezuela', flag: '🇻🇪' },
  { country: 'Guyana', flag: '🇬🇾' },
  { country: 'Suriname', flag: '🇸🇷' },
  { country: 'French Guiana', flag: '🇬🇫' },
  { country: 'Ecuador', flag: '🇪🇨' },
  { country: 'Bolivia', flag: '🇧🇴' },
  { country: 'Paraguay', flag: '🇵🇾' },
  { country: 'Uruguay', flag: '🇺🇾' },
  { country: 'Falkland Islands', flag: '🇫🇰' },
  { country: 'South Georgia', flag: '🇬🇸' },
  { country: 'Panama', flag: '🇵🇦' },
  { country: 'Costa Rica', flag: '🇨🇷' },
  { country: 'Nicaragua', flag: '🇳🇮' },
  { country: 'Honduras', flag: '🇭🇳' },
  { country: 'El Salvador', flag: '🇸🇻' },
  { country: 'Guatemala', flag: '🇬🇹' },
  { country: 'Belize', flag: '🇧🇿' },
  { country: 'Cuba', flag: '🇨🇺' },
  { country: 'Jamaica', flag: '🇯🇲' },
  { country: 'Haiti', flag: '🇭🇹' },
  { country: 'Dominican Republic', flag: '🇩🇴' },
  { country: 'Puerto Rico', flag: '🇵🇷' },
  { country: 'Bahamas', flag: '🇧🇸' },
  { country: 'Bermuda', flag: '🇧🇲' },
  { country: 'Barbados', flag: '🇧🇧' },
  { country: 'Trinidad and Tobago', flag: '🇹🇹' },
  { country: 'Grenada', flag: '🇬🇩' },
  { country: 'Saint Vincent', flag: '🇻🇨' },
  { country: 'Saint Lucia', flag: '🇱🇨' },
  { country: 'Dominica', flag: '🇩🇲' },
  { country: 'Antigua and Barbuda', flag: '🇦🇬' },
  { country: 'Saint Kitts and Nevis', flag: '🇰🇳' },
  { country: 'Montserrat', flag: '🇲🇸' },
  { country: 'Anguilla', flag: '🇦🇮' },
  { country: 'British Virgin Islands', flag: '🇻🇬' },
  { country: 'US Virgin Islands', flag: '🇻🇮' },
  { country: 'Cayman Islands', flag: '🇰🇾' },
  { country: 'Turks and Caicos', flag: '🇹🇨' },
  { country: 'Aruba', flag: '🇦🇼' },
  { country: 'Curacao', flag: '🇨🇼' },
  { country: 'Sint Maarten', flag: '🇸🇽' },
  { country: 'Bonaire', flag: '🇧🇶' },
  { country: 'Saba', flag: '🇧🇶' },
  { country: 'Sint Eustatius', flag: '🇧🇶' },
  { country: 'Greenland', flag: '🇬🇱' },
  { country: 'Faroe Islands', flag: '🇫🇴' },
  { country: 'Svalbard', flag: '🇸🇯' },
  { country: 'Jan Mayen', flag: '🇸🇯' },
  { country: 'Gibraltar', flag: '🇬🇮' },
  { country: 'Andorra', flag: '🇦🇩' },
  { country: 'Monaco', flag: '🇲🇨' },
  { country: 'Liechtenstein', flag: '🇱🇮' },
  { country: 'San Marino', flag: '🇸🇲' },
  { country: 'Vatican', flag: '🇻🇦' },
  { country: 'Sovereign Military Order of Malta', flag: '🇲🇹' }
]

function getRandomFlag(): { country: string; flag: string } {
  const index = Math.floor(Math.random() * RANDOM_FLAGS.length)
  return RANDOM_FLAGS[index]
}

// แมพประเทศจากโดเมน/hostname
function getCountryFromHostname(hostname: string): { country: string; flag: string } {
  const lowerHost = hostname.toLowerCase()
  const parts = lowerHost.split('.')
  const subdomain = parts[0]
  
  // Asia
  if (subdomain.includes('sg') || subdomain.includes('singapore') || lowerHost.includes('singapore')) {
    return { country: 'Singapore', flag: '🇸🇬' }
  }
  if (subdomain.includes('jp') || subdomain.includes('japan') || subdomain.includes('tokyo') || subdomain.includes('osaka')) {
    return { country: 'Japan', flag: '🇯🇵' }
  }
  if (subdomain.includes('kr') || subdomain.includes('korea') || subdomain.includes('seoul')) {
    return { country: 'South Korea', flag: '🇰🇷' }
  }
  if (subdomain.includes('hk') || subdomain.includes('hongkong') || subdomain.includes('hong kong')) {
    return { country: 'Hong Kong', flag: '🇭🇰' }
  }
  if (subdomain.includes('tw') || subdomain.includes('taiwan') || subdomain.includes('taipei')) {
    return { country: 'Taiwan', flag: '🇹🇼' }
  }
  if (subdomain.includes('th') || subdomain.includes('thailand') || subdomain.includes('bangkok')) {
    return { country: 'Thailand', flag: '🇹🇭' }
  }
  if (subdomain.includes('vn') || subdomain.includes('vietnam') || subdomain.includes('viet nam')) {
    return { country: 'Vietnam', flag: '🇻🇳' }
  }
  if (subdomain.includes('my') || subdomain.includes('malaysia') || subdomain.includes('kuala')) {
    return { country: 'Malaysia', flag: '🇲🇾' }
  }
  if (subdomain.includes('id') || subdomain.includes('indonesia') || subdomain.includes('jakarta')) {
    return { country: 'Indonesia', flag: '🇮🇩' }
  }
  if (subdomain.includes('ph') || subdomain.includes('philippines') || subdomain.includes('manila')) {
    return { country: 'Philippines', flag: '🇵🇭' }
  }
  if (subdomain.includes('in') || subdomain.includes('india') || subdomain.includes('mumbai') || subdomain.includes('bangalore')) {
    return { country: 'India', flag: '🇮🇳' }
  }
  if (subdomain.includes('cn') || subdomain.includes('china') || subdomain.includes('beijing') || subdomain.includes('shanghai')) {
    return { country: 'China', flag: '🇨🇳' }
  }
  
  // Europe
  if (subdomain.includes('de') || subdomain.includes('germany') || subdomain.includes('frankfurt') || subdomain.includes('berlin')) {
    return { country: 'Germany', flag: '🇩🇪' }
  }
  if (subdomain.includes('fr') || subdomain.includes('france') || subdomain.includes('paris')) {
    return { country: 'France', flag: '🇫🇷' }
  }
  if (subdomain.includes('uk') || subdomain.includes('gb') || subdomain.includes('britain') || subdomain.includes('london') || subdomain.includes('manchester')) {
    return { country: 'United Kingdom', flag: '🇬🇧' }
  }
  if (subdomain.includes('nl') || subdomain.includes('netherlands') || subdomain.includes('amsterdam')) {
    return { country: 'Netherlands', flag: '🇳🇱' }
  }
  if (subdomain.includes('se') || subdomain.includes('sweden') || subdomain.includes('stockholm')) {
    return { country: 'Sweden', flag: '🇸🇪' }
  }
  if (subdomain.includes('no') || subdomain.includes('norway') || subdomain.includes('oslo')) {
    return { country: 'Norway', flag: '🇳🇴' }
  }
  if (subdomain.includes('fi') || subdomain.includes('finland') || subdomain.includes('helsinki')) {
    return { country: 'Finland', flag: '🇫🇮' }
  }
  if (subdomain.includes('dk') || subdomain.includes('denmark') || subdomain.includes('copenhagen')) {
    return { country: 'Denmark', flag: '🇩🇰' }
  }
  if (subdomain.includes('pl') || subdomain.includes('poland') || subdomain.includes('warsaw')) {
    return { country: 'Poland', flag: '🇵🇱' }
  }
  if (subdomain.includes('ru') || subdomain.includes('russia') || subdomain.includes('moscow') || subdomain.includes('petersburg')) {
    return { country: 'Russia', flag: '🇷🇺' }
  }
  if (subdomain.includes('ua') || subdomain.includes('ukraine') || subdomain.includes('kyiv')) {
    return { country: 'Ukraine', flag: '🇺🇦' }
  }
  if (subdomain.includes('tr') || subdomain.includes('turkey') || subdomain.includes('istanbul')) {
    return { country: 'Turkey', flag: '🇹🇷' }
  }
  if (subdomain.includes('it') || subdomain.includes('italy') || subdomain.includes('milan') || subdomain.includes('rome')) {
    return { country: 'Italy', flag: '🇮🇹' }
  }
  if (subdomain.includes('es') || subdomain.includes('spain') || subdomain.includes('madrid') || subdomain.includes('barcelona')) {
    return { country: 'Spain', flag: '🇪🇸' }
  }
  if (subdomain.includes('pt') || subdomain.includes('portugal') || subdomain.includes('lisbon')) {
    return { country: 'Portugal', flag: '🇵🇹' }
  }
  if (subdomain.includes('ch') || subdomain.includes('switzerland') || subdomain.includes('zurich')) {
    return { country: 'Switzerland', flag: '🇨🇭' }
  }
  if (subdomain.includes('at') || subdomain.includes('austria') || subdomain.includes('vienna')) {
    return { country: 'Austria', flag: '🇦🇹' }
  }
  if (subdomain.includes('be') || subdomain.includes('belgium') || subdomain.includes('brussels')) {
    return { country: 'Belgium', flag: '🇧🇪' }
  }
  if (subdomain.includes('cz') || subdomain.includes('czech') || subdomain.includes('prague')) {
    return { country: 'Czech Republic', flag: '🇨🇿' }
  }
  if (subdomain.includes('gr') || subdomain.includes('greece') || subdomain.includes('athens')) {
    return { country: 'Greece', flag: '🇬🇷' }
  }
  if (subdomain.includes('ie') || subdomain.includes('ireland') || subdomain.includes('dublin')) {
    return { country: 'Ireland', flag: '🇮🇪' }
  }
  if (subdomain.includes('ro') || subdomain.includes('romania') || subdomain.includes('bucharest')) {
    return { country: 'Romania', flag: '🇷🇴' }
  }
  if (subdomain.includes('bg') || subdomain.includes('bulgaria') || subdomain.includes('sofia')) {
    return { country: 'Bulgaria', flag: '🇧🇬' }
  }
  if (subdomain.includes('hr') || subdomain.includes('croatia') || subdomain.includes('zagreb')) {
    return { country: 'Croatia', flag: '🇭🇷' }
  }
  if (subdomain.includes('rs') || subdomain.includes('serbia') || subdomain.includes('belgrade')) {
    return { country: 'Serbia', flag: '🇷🇸' }
  }
  if (subdomain.includes('hu') || subdomain.includes('hungary') || subdomain.includes('budapest')) {
    return { country: 'Hungary', flag: '🇭🇺' }
  }
  
  // Americas
  if (subdomain.includes('us') || subdomain.includes('usa') || subdomain.includes('united states') || subdomain.includes('america') || subdomain.includes('newyork') || subdomain.includes('losangeles') || subdomain.includes('chicago') || subdomain.includes('miami') || subdomain.includes('seattle') || subdomain.includes('silicon') || subdomain.includes('dallas') || subdomain.includes('atlanta') || subdomain.includes('denver') || subdomain.includes('phoenix')) {
    return { country: 'United States', flag: '🇺🇸' }
  }
  if (subdomain.includes('ca') || subdomain.includes('canada') || subdomain.includes('toronto') || subdomain.includes('vancouver') || subdomain.includes('montreal')) {
    return { country: 'Canada', flag: '🇨🇦' }
  }
  if (subdomain.includes('br') || subdomain.includes('brazil') || subdomain.includes('saopaulo') || subdomain.includes('rio')) {
    return { country: 'Brazil', flag: '🇧🇷' }
  }
  if (subdomain.includes('mx') || subdomain.includes('mexico') || subdomain.includes('mexicocity')) {
    return { country: 'Mexico', flag: '🇲🇽' }
  }
  if (subdomain.includes('ar') || subdomain.includes('argentina') || subdomain.includes('buenosaires')) {
    return { country: 'Argentina', flag: '🇦🇷' }
  }
  if (subdomain.includes('cl') || subdomain.includes('chile') || subdomain.includes('santiago')) {
    return { country: 'Chile', flag: '🇨🇱' }
  }
  if (subdomain.includes('co') || subdomain.includes('colombia') || subdomain.includes('bogota')) {
    return { country: 'Colombia', flag: '🇨🇴' }
  }
  if (subdomain.includes('pe') || subdomain.includes('peru') || subdomain.includes('lima')) {
    return { country: 'Peru', flag: '🇵🇪' }
  }
  
  // Oceania
  if (subdomain.includes('au') || subdomain.includes('australia') || subdomain.includes('sydney') || subdomain.includes('melbourne') || subdomain.includes('brisbane') || subdomain.includes('perth')) {
    return { country: 'Australia', flag: '🇦🇺' }
  }
  if (subdomain.includes('nz') || subdomain.includes('newzealand') || subdomain.includes('auckland')) {
    return { country: 'New Zealand', flag: '🇳🇿' }
  }
  
  // Middle East
  if (subdomain.includes('ae') || subdomain.includes('uae') || subdomain.includes('dubai') || subdomain.includes('abudhabi')) {
    return { country: 'UAE', flag: '🇦🇪' }
  }
  if (subdomain.includes('sa') || subdomain.includes('saudi') || subdomain.includes('riyadh')) {
    return { country: 'Saudi Arabia', flag: '🇸🇦' }
  }
  if (subdomain.includes('il') || subdomain.includes('israel') || subdomain.includes('telaviv')) {
    return { country: 'Israel', flag: '🇮🇱' }
  }
  if (subdomain.includes('qa') || subdomain.includes('qatar') || subdomain.includes('doha')) {
    return { country: 'Qatar', flag: '🇶🇦' }
  }
  if (subdomain.includes('bh') || subdomain.includes('bahrain') || subdomain.includes('manama')) {
    return { country: 'Bahrain', flag: '🇧🇭' }
  }
  if (subdomain.includes('om') || subdomain.includes('oman') || subdomain.includes('muscat')) {
    return { country: 'Oman', flag: '🇴🇲' }
  }
  if (subdomain.includes('kw') || subdomain.includes('kuwait')) {
    return { country: 'Kuwait', flag: '🇰🇼' }
  }
  
  // Africa
  if (subdomain.includes('za') || subdomain.includes('southafrica') || subdomain.includes('johannesburg') || subdomain.includes('capetown')) {
    return { country: 'South Africa', flag: '🇿🇦' }
  }
  if (subdomain.includes('eg') || subdomain.includes('egypt') || subdomain.includes('cairo')) {
    return { country: 'Egypt', flag: '🇪🇬' }
  }
  if (subdomain.includes('ng') || subdomain.includes('nigeria') || subdomain.includes('lagos')) {
    return { country: 'Nigeria', flag: '🇳🇬' }
  }
  if (subdomain.includes('ke') || subdomain.includes('kenya') || subdomain.includes('nairobi')) {
    return { country: 'Kenya', flag: '🇰🇪' }
  }
  if (subdomain.includes('ma') || subdomain.includes('morocco') || subdomain.includes('casablanca')) {
    return { country: 'Morocco', flag: '🇲🇦' }
  }
  
  // สุ่มธงสำหรับ Unknown
  return getRandomFlag()
}

// แยกข้อมูลจาก VLESS link
function parseVlessLink(link: string): VlessConfig | null {
  try {
    if (!link.startsWith('vless://')) return null
    
    const url = new URL(link)
    const uuid = url.username
    const hostname = url.hostname
    const port = url.port || '443'
    
    const countryInfo = getCountryFromHostname(hostname)
    
    return {
      id: `${uuid.substring(0, 8)}`,
      link,
      country: countryInfo.country,
      flag: countryInfo.flag,
      hostname,
      port,
      uuid: uuid.substring(0, 8) + '****'
    }
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const url = 'https://raw.githubusercontent.com/ebrasha/free-v2ray-public-list/refs/heads/main/vless_configs.txt'
    
    // No cache - fetch fresh data every time
    const response = await fetch(url, { 
      cache: 'no-store',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch configs')
    }
    
    const text = await response.text()
    const lines = text.split('\n')
    
    // กรองเฉพาะที่มี speedtest.net และเป็น vless - ดึงทั้งหมดไม่จำกัด
    const filtered = lines.filter(line => line.includes('vless://') && line.includes('speedtest.net'))
    
    // Parse ข้อมูลทั้งหมด
    const configs = filtered
      .map(parseVlessLink)
      .filter((config): config is VlessConfig => config !== null)
    
    // Group by country
    const grouped = configs.reduce((acc, config) => {
      const key = config.country
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(config)
      return acc
    }, {} as Record<string, VlessConfig[]>)
    
    return NextResponse.json({ 
      success: true, 
      configs,
      grouped,
      total: configs.length,
      updatedAt: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error fetching vless configs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch configs' },
      { status: 500 }
    )
  }
}
