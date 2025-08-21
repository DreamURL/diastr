// Icon Placement Algorithm for Cross Stitch Patterns
// Prevents visual confusion by avoiding similar icons in adjacent positions

// 🚀 GLOBAL CACHE: 동일한 색상 조합에 대한 아이콘 할당 재사용
const ICON_ASSIGNMENT_CACHE = new Map<string, Map<string, Icon>>()

// 캐시 키 생성: 색상 조합 + 그리드 크기
function createCacheKey(colors: string[], gridWidth: number, gridHeight: number): string {
  const sortedColors = [...colors].sort().join(',')
  return `${sortedColors}|${gridWidth}x${gridHeight}`
}

// 캐시 관리 함수들
export function clearIconAssignmentCache(): void {
  ICON_ASSIGNMENT_CACHE.clear()
  console.log('🗑️ Icon assignment cache cleared')
}

export function getIconAssignmentCacheSize(): number {
  return ICON_ASSIGNMENT_CACHE.size
}

export function getIconAssignmentCacheStats(): { size: number, keys: string[] } {
  return {
    size: ICON_ASSIGNMENT_CACHE.size,
    keys: Array.from(ICON_ASSIGNMENT_CACHE.keys()).map(k => k.slice(0, 50) + '...')
  }
}

export interface Icon {
  id: string
  symbol: string
  type: 'number' | 'letter' 
  category: string // for grouping similar icons
  visualComplexity: number // 1-5, higher is more complex
  priority: number // 1-4, lower is higher priority (1=numbers, 2=shapes, 3=letters, 4=special)
  fontSize?: number // Font size multiplier for proper display (1.0 = default, 0.8 = smaller for two-digit)
  isDoubleDigit?: boolean // Flag for two-digit numbers requiring special handling
}

export interface IconAssignment {
  dmcCode: string
  icon: Icon
  positions: Array<{ x: number; y: number }>
}

// HIGH READABILITY ICON SET - Optimized for cross stitch pattern clarity
export const AVAILABLE_ICONS: Icon[] = [
  // PRIORITY 1: NUMBERS (0-50) - Highest clarity, most familiar
  // Single digit numbers (0-9) - Default font size
  { id: 'num_0', symbol: '0', type: 'number', category: 'round_num', visualComplexity: 2, priority: 1, fontSize: 1.0, isDoubleDigit: false },
  { id: 'num_1', symbol: '1', type: 'number', category: 'thin_num', visualComplexity: 1, priority: 1, fontSize: 1.0, isDoubleDigit: false },
  { id: 'num_2', symbol: '2', type: 'number', category: 'curved_num', visualComplexity: 3, priority: 1, fontSize: 1.0, isDoubleDigit: false },
  { id: 'num_3', symbol: '3', type: 'number', category: 'curved_num', visualComplexity: 3, priority: 1, fontSize: 1.0, isDoubleDigit: false },
  { id: 'num_4', symbol: '4', type: 'number', category: 'angular_num', visualComplexity: 3, priority: 1, fontSize: 1.0, isDoubleDigit: false },
  { id: 'num_5', symbol: '5', type: 'number', category: 'mixed_num', visualComplexity: 3, priority: 1, fontSize: 1.0, isDoubleDigit: false },
  { id: 'num_6', symbol: '6', type: 'number', category: 'curved_num', visualComplexity: 3, priority: 1, fontSize: 1.0, isDoubleDigit: false },
  { id: 'num_7', symbol: '7', type: 'number', category: 'angled_num', visualComplexity: 2, priority: 1, fontSize: 1.0, isDoubleDigit: false },
  { id: 'num_8', symbol: '8', type: 'number', category: 'round_num', visualComplexity: 4, priority: 1, fontSize: 1.0, isDoubleDigit: false },
  { id: 'num_9', symbol: '9', type: 'number', category: 'curved_num', visualComplexity: 3, priority: 1, fontSize: 1.0, isDoubleDigit: false },

  // Double digit numbers (10-50) - Smaller font size for better fit
  // Numbers 10-19
  { id: 'num_10', symbol: '10', type: 'number', category: 'two_digit_1x', visualComplexity: 4, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_11', symbol: '11', type: 'number', category: 'two_digit_1x', visualComplexity: 3, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_12', symbol: '12', type: 'number', category: 'two_digit_1x', visualComplexity: 4, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_13', symbol: '13', type: 'number', category: 'two_digit_1x', visualComplexity: 4, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_14', symbol: '14', type: 'number', category: 'two_digit_1x', visualComplexity: 4, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_15', symbol: '15', type: 'number', category: 'two_digit_1x', visualComplexity: 4, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_16', symbol: '16', type: 'number', category: 'two_digit_1x', visualComplexity: 4, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_17', symbol: '17', type: 'number', category: 'two_digit_1x', visualComplexity: 3, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_18', symbol: '18', type: 'number', category: 'two_digit_1x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_19', symbol: '19', type: 'number', category: 'two_digit_1x', visualComplexity: 4, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  
  // Numbers 20-29
  { id: 'num_20', symbol: '20', type: 'number', category: 'two_digit_2x', visualComplexity: 4, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_21', symbol: '21', type: 'number', category: 'two_digit_2x', visualComplexity: 4, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_22', symbol: '22', type: 'number', category: 'two_digit_2x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_23', symbol: '23', type: 'number', category: 'two_digit_2x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_24', symbol: '24', type: 'number', category: 'two_digit_2x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_25', symbol: '25', type: 'number', category: 'two_digit_2x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_26', symbol: '26', type: 'number', category: 'two_digit_2x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_27', symbol: '27', type: 'number', category: 'two_digit_2x', visualComplexity: 4, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_28', symbol: '28', type: 'number', category: 'two_digit_2x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_29', symbol: '29', type: 'number', category: 'two_digit_2x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  
  // Numbers 30-39
  { id: 'num_30', symbol: '30', type: 'number', category: 'two_digit_3x', visualComplexity: 4, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_31', symbol: '31', type: 'number', category: 'two_digit_3x', visualComplexity: 4, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_32', symbol: '32', type: 'number', category: 'two_digit_3x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_33', symbol: '33', type: 'number', category: 'two_digit_3x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_34', symbol: '34', type: 'number', category: 'two_digit_3x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_35', symbol: '35', type: 'number', category: 'two_digit_3x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_36', symbol: '36', type: 'number', category: 'two_digit_3x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_37', symbol: '37', type: 'number', category: 'two_digit_3x', visualComplexity: 4, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_38', symbol: '38', type: 'number', category: 'two_digit_3x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_39', symbol: '39', type: 'number', category: 'two_digit_3x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  
  // Numbers 40-49
  { id: 'num_40', symbol: '40', type: 'number', category: 'two_digit_4x', visualComplexity: 4, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_41', symbol: '41', type: 'number', category: 'two_digit_4x', visualComplexity: 4, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_42', symbol: '42', type: 'number', category: 'two_digit_4x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_43', symbol: '43', type: 'number', category: 'two_digit_4x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_44', symbol: '44', type: 'number', category: 'two_digit_4x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_45', symbol: '45', type: 'number', category: 'two_digit_4x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_46', symbol: '46', type: 'number', category: 'two_digit_4x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_47', symbol: '47', type: 'number', category: 'two_digit_4x', visualComplexity: 4, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_48', symbol: '48', type: 'number', category: 'two_digit_4x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_49', symbol: '49', type: 'number', category: 'two_digit_4x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  
  { id: 'num_50', symbol: '50', type: 'number', category: 'two_digit_5x', visualComplexity: 4, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_51', symbol: '51', type: 'number', category: 'two_digit_5x', visualComplexity: 4, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_52', symbol: '52', type: 'number', category: 'two_digit_5x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_53', symbol: '53', type: 'number', category: 'two_digit_5x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_54', symbol: '54', type: 'number', category: 'two_digit_5x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_55', symbol: '55', type: 'number', category: 'two_digit_5x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_56', symbol: '56', type: 'number', category: 'two_digit_5x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_57', symbol: '57', type: 'number', category: 'two_digit_5x', visualComplexity: 4, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_58', symbol: '58', type: 'number', category: 'two_digit_5x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_59', symbol: '59', type: 'number', category: 'two_digit_5x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  
  // Numbers 60-69
  { id: 'num_60', symbol: '60', type: 'number', category: 'two_digit_6x', visualComplexity: 4, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_61', symbol: '61', type: 'number', category: 'two_digit_6x', visualComplexity: 4, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_62', symbol: '62', type: 'number', category: 'two_digit_6x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_63', symbol: '63', type: 'number', category: 'two_digit_6x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_64', symbol: '64', type: 'number', category: 'two_digit_6x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_65', symbol: '65', type: 'number', category: 'two_digit_6x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_66', symbol: '66', type: 'number', category: 'two_digit_6x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_67', symbol: '67', type: 'number', category: 'two_digit_6x', visualComplexity: 4, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_68', symbol: '68', type: 'number', category: 'two_digit_6x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_69', symbol: '69', type: 'number', category: 'two_digit_6x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  
  // Numbers 70-79
  { id: 'num_70', symbol: '70', type: 'number', category: 'two_digit_7x', visualComplexity: 4, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_71', symbol: '71', type: 'number', category: 'two_digit_7x', visualComplexity: 4, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_72', symbol: '72', type: 'number', category: 'two_digit_7x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_73', symbol: '73', type: 'number', category: 'two_digit_7x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_74', symbol: '74', type: 'number', category: 'two_digit_7x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_75', symbol: '75', type: 'number', category: 'two_digit_7x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_76', symbol: '76', type: 'number', category: 'two_digit_7x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_77', symbol: '77', type: 'number', category: 'two_digit_7x', visualComplexity: 4, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_78', symbol: '78', type: 'number', category: 'two_digit_7x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_79', symbol: '79', type: 'number', category: 'two_digit_7x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  
  // Numbers 80-89
  { id: 'num_80', symbol: '80', type: 'number', category: 'two_digit_8x', visualComplexity: 4, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_81', symbol: '81', type: 'number', category: 'two_digit_8x', visualComplexity: 4, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_82', symbol: '82', type: 'number', category: 'two_digit_8x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_83', symbol: '83', type: 'number', category: 'two_digit_8x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_84', symbol: '84', type: 'number', category: 'two_digit_8x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_85', symbol: '85', type: 'number', category: 'two_digit_8x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_86', symbol: '86', type: 'number', category: 'two_digit_8x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_87', symbol: '87', type: 'number', category: 'two_digit_8x', visualComplexity: 4, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_88', symbol: '88', type: 'number', category: 'two_digit_8x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_89', symbol: '89', type: 'number', category: 'two_digit_8x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  
  // Numbers 90-99
  { id: 'num_90', symbol: '90', type: 'number', category: 'two_digit_9x', visualComplexity: 4, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_91', symbol: '91', type: 'number', category: 'two_digit_9x', visualComplexity: 4, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_92', symbol: '92', type: 'number', category: 'two_digit_9x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_93', symbol: '93', type: 'number', category: 'two_digit_9x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_94', symbol: '94', type: 'number', category: 'two_digit_9x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_95', symbol: '95', type: 'number', category: 'two_digit_9x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_96', symbol: '96', type: 'number', category: 'two_digit_9x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_97', symbol: '97', type: 'number', category: 'two_digit_9x', visualComplexity: 4, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_98', symbol: '98', type: 'number', category: 'two_digit_9x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },
  { id: 'num_99', symbol: '99', type: 'number', category: 'two_digit_9x', visualComplexity: 5, priority: 1, fontSize: 0.75, isDoubleDigit: true },

  // PRIORITY 3: DISTINCT LETTERS - Visually different characters
  { id: 'letter_A', symbol: 'a', type: 'letter', category: 'angular_letter', visualComplexity: 3, priority: 3 },
  { id: 'letter_B', symbol: 'b', type: 'letter', category: 'curved_letter', visualComplexity: 4, priority: 3 },
  { id: 'letter_C', symbol: 'c', type: 'letter', category: 'curved_letter', visualComplexity: 2, priority: 3 },
  { id: 'letter_D', symbol: 'd', type: 'letter', category: 'curved_letter', visualComplexity: 3, priority: 3 },
  { id: 'letter_E', symbol: 'e', type: 'letter', category: 'angular_letter', visualComplexity: 3, priority: 3 },
  { id: 'letter_F', symbol: 'f', type: 'letter', category: 'angular_letter', visualComplexity: 3, priority: 3 },
  { id: 'letter_G', symbol: 'g', type: 'letter', category: 'curved_letter', visualComplexity: 4, priority: 3 },
  { id: 'letter_H', symbol: 'h', type: 'letter', category: 'angular_letter', visualComplexity: 3, priority: 3 },
  { id: 'letter_I', symbol: 'i', type: 'letter', category: 'thin_letter', visualComplexity: 1, priority: 3 },
  { id: 'letter_J', symbol: 'j', type: 'letter', category: 'curved_letter', visualComplexity: 2, priority: 3 },
  { id: 'letter_K', symbol: 'k', type: 'letter', category: 'angular_letter', visualComplexity: 4, priority: 3 },
  { id: 'letter_L', symbol: 'l', type: 'letter', category: 'angular_letter', visualComplexity: 2, priority: 3 },
  { id: 'letter_M', symbol: 'm', type: 'letter', category: 'angular_letter', visualComplexity: 4, priority: 3 },
  { id: 'letter_N', symbol: 'n', type: 'letter', category: 'angular_letter', visualComplexity: 3, priority: 3 },
  { id: 'letter_P', symbol: 'p', type: 'letter', category: 'angular_letter', visualComplexity: 3, priority: 3 },
  { id: 'letter_Q', symbol: 'q', type: 'letter', category: 'round_letter', visualComplexity: 4, priority: 3 },
  { id: 'letter_R', symbol: 'r', type: 'letter', category: 'angular_letter', visualComplexity: 4, priority: 3 },
  { id: 'letter_S', symbol: 's', type: 'letter', category: 'curved_letter', visualComplexity: 4, priority: 3 },
  { id: 'letter_T', symbol: 't', type: 'letter', category: 'angular_letter', visualComplexity: 2, priority: 3 },
  { id: 'letter_U', symbol: 'u', type: 'letter', category: 'curved_letter', visualComplexity: 2, priority: 3 },
  { id: 'letter_V', symbol: 'v', type: 'letter', category: 'angular_letter', visualComplexity: 2, priority: 3 },
  { id: 'letter_W', symbol: 'w', type: 'letter', category: 'angular_letter', visualComplexity: 4, priority: 3 },
  { id: 'letter_X', symbol: 'x', type: 'letter', category: 'angular_letter', visualComplexity: 3, priority: 3 },
  { id: 'letter_Y', symbol: 'y', type: 'letter', category: 'angular_letter', visualComplexity: 3, priority: 3 },
  { id: 'letter_Z', symbol: 'z', type: 'letter', category: 'angular_letter', visualComplexity: 3, priority: 3 },
  
  // PRIORITY 3: TWO-LETTER COMBINATIONS - aa, ab, ac... za, zb... zz
  // aa-az combinations
  { id: 'letter_aa', symbol: 'aa', type: 'letter', category: 'two_letter_aa', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ab', symbol: 'ab', type: 'letter', category: 'two_letter_aa', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ac', symbol: 'ac', type: 'letter', category: 'two_letter_aa', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ad', symbol: 'ad', type: 'letter', category: 'two_letter_aa', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ae', symbol: 'ae', type: 'letter', category: 'two_letter_aa', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_af', symbol: 'af', type: 'letter', category: 'two_letter_aa', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ag', symbol: 'ag', type: 'letter', category: 'two_letter_aa', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ah', symbol: 'ah', type: 'letter', category: 'two_letter_aa', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ai', symbol: 'ai', type: 'letter', category: 'two_letter_aa', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_aj', symbol: 'aj', type: 'letter', category: 'two_letter_aa', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ak', symbol: 'ak', type: 'letter', category: 'two_letter_aa', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_al', symbol: 'al', type: 'letter', category: 'two_letter_aa', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_am', symbol: 'am', type: 'letter', category: 'two_letter_aa', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_an', symbol: 'an', type: 'letter', category: 'two_letter_aa', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ao', symbol: 'ao', type: 'letter', category: 'two_letter_aa', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ap', symbol: 'ap', type: 'letter', category: 'two_letter_aa', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_aq', symbol: 'aq', type: 'letter', category: 'two_letter_aa', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ar', symbol: 'ar', type: 'letter', category: 'two_letter_aa', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_as', symbol: 'as', type: 'letter', category: 'two_letter_aa', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_at', symbol: 'at', type: 'letter', category: 'two_letter_aa', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_au', symbol: 'au', type: 'letter', category: 'two_letter_aa', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_av', symbol: 'av', type: 'letter', category: 'two_letter_aa', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_aw', symbol: 'aw', type: 'letter', category: 'two_letter_aa', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ax', symbol: 'ax', type: 'letter', category: 'two_letter_aa', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ay', symbol: 'ay', type: 'letter', category: 'two_letter_aa', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_az', symbol: 'az', type: 'letter', category: 'two_letter_aa', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  
  // ba-bz combinations
  { id: 'letter_ba', symbol: 'ba', type: 'letter', category: 'two_letter_ba', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_bb', symbol: 'bb', type: 'letter', category: 'two_letter_ba', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_bc', symbol: 'bc', type: 'letter', category: 'two_letter_ba', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_bd', symbol: 'bd', type: 'letter', category: 'two_letter_ba', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_be', symbol: 'be', type: 'letter', category: 'two_letter_ba', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_bf', symbol: 'bf', type: 'letter', category: 'two_letter_ba', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_bg', symbol: 'bg', type: 'letter', category: 'two_letter_ba', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_bh', symbol: 'bh', type: 'letter', category: 'two_letter_ba', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_bi', symbol: 'bi', type: 'letter', category: 'two_letter_ba', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_bj', symbol: 'bj', type: 'letter', category: 'two_letter_ba', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_bk', symbol: 'bk', type: 'letter', category: 'two_letter_ba', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_bl', symbol: 'bl', type: 'letter', category: 'two_letter_ba', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_bm', symbol: 'bm', type: 'letter', category: 'two_letter_ba', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_bn', symbol: 'bn', type: 'letter', category: 'two_letter_ba', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_bo', symbol: 'bo', type: 'letter', category: 'two_letter_ba', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_bp', symbol: 'bp', type: 'letter', category: 'two_letter_ba', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_bq', symbol: 'bq', type: 'letter', category: 'two_letter_ba', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_br', symbol: 'br', type: 'letter', category: 'two_letter_ba', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_bs', symbol: 'bs', type: 'letter', category: 'two_letter_ba', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_bt', symbol: 'bt', type: 'letter', category: 'two_letter_ba', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_bu', symbol: 'bu', type: 'letter', category: 'two_letter_ba', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_bv', symbol: 'bv', type: 'letter', category: 'two_letter_ba', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_bw', symbol: 'bw', type: 'letter', category: 'two_letter_ba', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_bx', symbol: 'bx', type: 'letter', category: 'two_letter_ba', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_by', symbol: 'by', type: 'letter', category: 'two_letter_ba', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_bz', symbol: 'bz', type: 'letter', category: 'two_letter_ba', visualComplexity: 4, priority: 3, fontSize: 0.75 },

  // ca-cz combinations
  { id: 'letter_ca', symbol: 'ca', type: 'letter', category: 'two_letter_c', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_cb', symbol: 'cb', type: 'letter', category: 'two_letter_c', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_cc', symbol: 'cc', type: 'letter', category: 'two_letter_c', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_cd', symbol: 'cd', type: 'letter', category: 'two_letter_c', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ce', symbol: 'ce', type: 'letter', category: 'two_letter_c', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_cf', symbol: 'cf', type: 'letter', category: 'two_letter_c', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_cg', symbol: 'cg', type: 'letter', category: 'two_letter_c', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ch', symbol: 'ch', type: 'letter', category: 'two_letter_c', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ci', symbol: 'ci', type: 'letter', category: 'two_letter_c', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_cj', symbol: 'cj', type: 'letter', category: 'two_letter_c', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ck', symbol: 'ck', type: 'letter', category: 'two_letter_c', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_cl', symbol: 'cl', type: 'letter', category: 'two_letter_c', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_cm', symbol: 'cm', type: 'letter', category: 'two_letter_c', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_cn', symbol: 'cn', type: 'letter', category: 'two_letter_c', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_co', symbol: 'co', type: 'letter', category: 'two_letter_c', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_cp', symbol: 'cp', type: 'letter', category: 'two_letter_c', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_cq', symbol: 'cq', type: 'letter', category: 'two_letter_c', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_cr', symbol: 'cr', type: 'letter', category: 'two_letter_c', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_cs', symbol: 'cs', type: 'letter', category: 'two_letter_c', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ct', symbol: 'ct', type: 'letter', category: 'two_letter_c', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_cu', symbol: 'cu', type: 'letter', category: 'two_letter_c', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_cv', symbol: 'cv', type: 'letter', category: 'two_letter_c', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_cw', symbol: 'cw', type: 'letter', category: 'two_letter_c', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_cx', symbol: 'cx', type: 'letter', category: 'two_letter_c', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_cy', symbol: 'cy', type: 'letter', category: 'two_letter_c', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_cz', symbol: 'cz', type: 'letter', category: 'two_letter_c', visualComplexity: 4, priority: 3, fontSize: 0.75 },

  // da-dz combinations
  { id: 'letter_da', symbol: 'da', type: 'letter', category: 'two_letter_d', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_db', symbol: 'db', type: 'letter', category: 'two_letter_d', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_dc', symbol: 'dc', type: 'letter', category: 'two_letter_d', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_dd', symbol: 'dd', type: 'letter', category: 'two_letter_d', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_de', symbol: 'de', type: 'letter', category: 'two_letter_d', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_df', symbol: 'df', type: 'letter', category: 'two_letter_d', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_dg', symbol: 'dg', type: 'letter', category: 'two_letter_d', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_dh', symbol: 'dh', type: 'letter', category: 'two_letter_d', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_di', symbol: 'di', type: 'letter', category: 'two_letter_d', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_dj', symbol: 'dj', type: 'letter', category: 'two_letter_d', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_dk', symbol: 'dk', type: 'letter', category: 'two_letter_d', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_dl', symbol: 'dl', type: 'letter', category: 'two_letter_d', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_dm', symbol: 'dm', type: 'letter', category: 'two_letter_d', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_dn', symbol: 'dn', type: 'letter', category: 'two_letter_d', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_do', symbol: 'do', type: 'letter', category: 'two_letter_d', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_dp', symbol: 'dp', type: 'letter', category: 'two_letter_d', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_dq', symbol: 'dq', type: 'letter', category: 'two_letter_d', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_dr', symbol: 'dr', type: 'letter', category: 'two_letter_d', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ds', symbol: 'ds', type: 'letter', category: 'two_letter_d', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_dt', symbol: 'dt', type: 'letter', category: 'two_letter_d', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_du', symbol: 'du', type: 'letter', category: 'two_letter_d', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_dv', symbol: 'dv', type: 'letter', category: 'two_letter_d', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_dw', symbol: 'dw', type: 'letter', category: 'two_letter_d', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_dx', symbol: 'dx', type: 'letter', category: 'two_letter_d', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_dy', symbol: 'dy', type: 'letter', category: 'two_letter_d', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_dz', symbol: 'dz', type: 'letter', category: 'two_letter_d', visualComplexity: 4, priority: 3, fontSize: 0.75 },

  // ea-ez combinations
  { id: 'letter_ea', symbol: 'ea', type: 'letter', category: 'two_letter_e', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_eb', symbol: 'eb', type: 'letter', category: 'two_letter_e', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ec', symbol: 'ec', type: 'letter', category: 'two_letter_e', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ed', symbol: 'ed', type: 'letter', category: 'two_letter_e', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ee', symbol: 'ee', type: 'letter', category: 'two_letter_e', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ef', symbol: 'ef', type: 'letter', category: 'two_letter_e', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_eg', symbol: 'eg', type: 'letter', category: 'two_letter_e', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_eh', symbol: 'eh', type: 'letter', category: 'two_letter_e', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ei', symbol: 'ei', type: 'letter', category: 'two_letter_e', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ej', symbol: 'ej', type: 'letter', category: 'two_letter_e', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ek', symbol: 'ek', type: 'letter', category: 'two_letter_e', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_el', symbol: 'el', type: 'letter', category: 'two_letter_e', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_em', symbol: 'em', type: 'letter', category: 'two_letter_e', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_en', symbol: 'en', type: 'letter', category: 'two_letter_e', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_eo', symbol: 'eo', type: 'letter', category: 'two_letter_e', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ep', symbol: 'ep', type: 'letter', category: 'two_letter_e', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_eq', symbol: 'eq', type: 'letter', category: 'two_letter_e', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_er', symbol: 'er', type: 'letter', category: 'two_letter_e', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_es', symbol: 'es', type: 'letter', category: 'two_letter_e', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_et', symbol: 'et', type: 'letter', category: 'two_letter_e', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_eu', symbol: 'eu', type: 'letter', category: 'two_letter_e', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ev', symbol: 'ev', type: 'letter', category: 'two_letter_e', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ew', symbol: 'ew', type: 'letter', category: 'two_letter_e', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ex', symbol: 'ex', type: 'letter', category: 'two_letter_e', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ey', symbol: 'ey', type: 'letter', category: 'two_letter_e', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ez', symbol: 'ez', type: 'letter', category: 'two_letter_e', visualComplexity: 4, priority: 3, fontSize: 0.75 },

  // fa-fz combinations
  { id: 'letter_fa', symbol: 'fa', type: 'letter', category: 'two_letter_f', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_fb', symbol: 'fb', type: 'letter', category: 'two_letter_f', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_fc', symbol: 'fc', type: 'letter', category: 'two_letter_f', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_fd', symbol: 'fd', type: 'letter', category: 'two_letter_f', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_fe', symbol: 'fe', type: 'letter', category: 'two_letter_f', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ff', symbol: 'ff', type: 'letter', category: 'two_letter_f', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_fg', symbol: 'fg', type: 'letter', category: 'two_letter_f', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_fh', symbol: 'fh', type: 'letter', category: 'two_letter_f', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_fi', symbol: 'fi', type: 'letter', category: 'two_letter_f', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_fj', symbol: 'fj', type: 'letter', category: 'two_letter_f', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_fk', symbol: 'fk', type: 'letter', category: 'two_letter_f', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_fl', symbol: 'fl', type: 'letter', category: 'two_letter_f', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_fm', symbol: 'fm', type: 'letter', category: 'two_letter_f', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_fn', symbol: 'fn', type: 'letter', category: 'two_letter_f', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_fo', symbol: 'fo', type: 'letter', category: 'two_letter_f', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_fp', symbol: 'fp', type: 'letter', category: 'two_letter_f', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_fq', symbol: 'fq', type: 'letter', category: 'two_letter_f', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_fr', symbol: 'fr', type: 'letter', category: 'two_letter_f', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_fs', symbol: 'fs', type: 'letter', category: 'two_letter_f', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ft', symbol: 'ft', type: 'letter', category: 'two_letter_f', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_fu', symbol: 'fu', type: 'letter', category: 'two_letter_f', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_fv', symbol: 'fv', type: 'letter', category: 'two_letter_f', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_fw', symbol: 'fw', type: 'letter', category: 'two_letter_f', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_fx', symbol: 'fx', type: 'letter', category: 'two_letter_f', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_fy', symbol: 'fy', type: 'letter', category: 'two_letter_f', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_fz', symbol: 'fz', type: 'letter', category: 'two_letter_f', visualComplexity: 4, priority: 3, fontSize: 0.75 },

  // ga-gz combinations
  { id: 'letter_ga', symbol: 'ga', type: 'letter', category: 'two_letter_g', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_gb', symbol: 'gb', type: 'letter', category: 'two_letter_g', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_gc', symbol: 'gc', type: 'letter', category: 'two_letter_g', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_gd', symbol: 'gd', type: 'letter', category: 'two_letter_g', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ge', symbol: 'ge', type: 'letter', category: 'two_letter_g', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_gf', symbol: 'gf', type: 'letter', category: 'two_letter_g', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_gg', symbol: 'gg', type: 'letter', category: 'two_letter_g', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_gh', symbol: 'gh', type: 'letter', category: 'two_letter_g', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_gi', symbol: 'gi', type: 'letter', category: 'two_letter_g', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_gj', symbol: 'gj', type: 'letter', category: 'two_letter_g', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_gk', symbol: 'gk', type: 'letter', category: 'two_letter_g', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_gl', symbol: 'gl', type: 'letter', category: 'two_letter_g', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_gm', symbol: 'gm', type: 'letter', category: 'two_letter_g', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_gn', symbol: 'gn', type: 'letter', category: 'two_letter_g', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_go', symbol: 'go', type: 'letter', category: 'two_letter_g', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_gp', symbol: 'gp', type: 'letter', category: 'two_letter_g', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_gq', symbol: 'gq', type: 'letter', category: 'two_letter_g', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_gr', symbol: 'gr', type: 'letter', category: 'two_letter_g', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_gs', symbol: 'gs', type: 'letter', category: 'two_letter_g', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_gt', symbol: 'gt', type: 'letter', category: 'two_letter_g', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_gu', symbol: 'gu', type: 'letter', category: 'two_letter_g', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_gv', symbol: 'gv', type: 'letter', category: 'two_letter_g', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_gw', symbol: 'gw', type: 'letter', category: 'two_letter_g', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_gx', symbol: 'gx', type: 'letter', category: 'two_letter_g', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_gy', symbol: 'gy', type: 'letter', category: 'two_letter_g', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_gz', symbol: 'gz', type: 'letter', category: 'two_letter_g', visualComplexity: 4, priority: 3, fontSize: 0.75 },

  // ha-hz combinations
  { id: 'letter_ha', symbol: 'ha', type: 'letter', category: 'two_letter_h', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_hb', symbol: 'hb', type: 'letter', category: 'two_letter_h', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_hc', symbol: 'hc', type: 'letter', category: 'two_letter_h', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_hd', symbol: 'hd', type: 'letter', category: 'two_letter_h', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_he', symbol: 'he', type: 'letter', category: 'two_letter_h', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_hf', symbol: 'hf', type: 'letter', category: 'two_letter_h', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_hg', symbol: 'hg', type: 'letter', category: 'two_letter_h', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_hh', symbol: 'hh', type: 'letter', category: 'two_letter_h', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_hi', symbol: 'hi', type: 'letter', category: 'two_letter_h', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_hj', symbol: 'hj', type: 'letter', category: 'two_letter_h', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_hk', symbol: 'hk', type: 'letter', category: 'two_letter_h', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_hl', symbol: 'hl', type: 'letter', category: 'two_letter_h', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_hm', symbol: 'hm', type: 'letter', category: 'two_letter_h', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_hn', symbol: 'hn', type: 'letter', category: 'two_letter_h', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ho', symbol: 'ho', type: 'letter', category: 'two_letter_h', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_hp', symbol: 'hp', type: 'letter', category: 'two_letter_h', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_hq', symbol: 'hq', type: 'letter', category: 'two_letter_h', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_hr', symbol: 'hr', type: 'letter', category: 'two_letter_h', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_hs', symbol: 'hs', type: 'letter', category: 'two_letter_h', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ht', symbol: 'ht', type: 'letter', category: 'two_letter_h', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_hu', symbol: 'hu', type: 'letter', category: 'two_letter_h', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_hv', symbol: 'hv', type: 'letter', category: 'two_letter_h', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_hw', symbol: 'hw', type: 'letter', category: 'two_letter_h', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_hx', symbol: 'hx', type: 'letter', category: 'two_letter_h', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_hy', symbol: 'hy', type: 'letter', category: 'two_letter_h', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_hz', symbol: 'hz', type: 'letter', category: 'two_letter_h', visualComplexity: 4, priority: 3, fontSize: 0.75 },

  // ia-iz combinations
  { id: 'letter_ia', symbol: 'ia', type: 'letter', category: 'two_letter_i', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ib', symbol: 'ib', type: 'letter', category: 'two_letter_i', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ic', symbol: 'ic', type: 'letter', category: 'two_letter_i', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_id', symbol: 'id', type: 'letter', category: 'two_letter_i', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ie', symbol: 'ie', type: 'letter', category: 'two_letter_i', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_if', symbol: 'if', type: 'letter', category: 'two_letter_i', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ig', symbol: 'ig', type: 'letter', category: 'two_letter_i', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ih', symbol: 'ih', type: 'letter', category: 'two_letter_i', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ii', symbol: 'ii', type: 'letter', category: 'two_letter_i', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ij', symbol: 'ij', type: 'letter', category: 'two_letter_i', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ik', symbol: 'ik', type: 'letter', category: 'two_letter_i', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_il', symbol: 'il', type: 'letter', category: 'two_letter_i', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_im', symbol: 'im', type: 'letter', category: 'two_letter_i', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_in', symbol: 'in', type: 'letter', category: 'two_letter_i', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_io', symbol: 'io', type: 'letter', category: 'two_letter_i', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ip', symbol: 'ip', type: 'letter', category: 'two_letter_i', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_iq', symbol: 'iq', type: 'letter', category: 'two_letter_i', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ir', symbol: 'ir', type: 'letter', category: 'two_letter_i', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_is', symbol: 'is', type: 'letter', category: 'two_letter_i', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_it', symbol: 'it', type: 'letter', category: 'two_letter_i', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_iu', symbol: 'iu', type: 'letter', category: 'two_letter_i', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_iv', symbol: 'iv', type: 'letter', category: 'two_letter_i', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_iw', symbol: 'iw', type: 'letter', category: 'two_letter_i', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ix', symbol: 'ix', type: 'letter', category: 'two_letter_i', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_iy', symbol: 'iy', type: 'letter', category: 'two_letter_i', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_iz', symbol: 'iz', type: 'letter', category: 'two_letter_i', visualComplexity: 4, priority: 3, fontSize: 0.75 },

  // ja-jz combinations
  { id: 'letter_ja', symbol: 'ja', type: 'letter', category: 'two_letter_j', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_jb', symbol: 'jb', type: 'letter', category: 'two_letter_j', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_jc', symbol: 'jc', type: 'letter', category: 'two_letter_j', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_jd', symbol: 'jd', type: 'letter', category: 'two_letter_j', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_je', symbol: 'je', type: 'letter', category: 'two_letter_j', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_jf', symbol: 'jf', type: 'letter', category: 'two_letter_j', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_jg', symbol: 'jg', type: 'letter', category: 'two_letter_j', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_jh', symbol: 'jh', type: 'letter', category: 'two_letter_j', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ji', symbol: 'ji', type: 'letter', category: 'two_letter_j', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_jj', symbol: 'jj', type: 'letter', category: 'two_letter_j', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_jk', symbol: 'jk', type: 'letter', category: 'two_letter_j', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_jl', symbol: 'jl', type: 'letter', category: 'two_letter_j', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_jm', symbol: 'jm', type: 'letter', category: 'two_letter_j', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_jn', symbol: 'jn', type: 'letter', category: 'two_letter_j', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_jo', symbol: 'jo', type: 'letter', category: 'two_letter_j', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_jp', symbol: 'jp', type: 'letter', category: 'two_letter_j', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_jq', symbol: 'jq', type: 'letter', category: 'two_letter_j', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_jr', symbol: 'jr', type: 'letter', category: 'two_letter_j', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_js', symbol: 'js', type: 'letter', category: 'two_letter_j', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_jt', symbol: 'jt', type: 'letter', category: 'two_letter_j', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ju', symbol: 'ju', type: 'letter', category: 'two_letter_j', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_jv', symbol: 'jv', type: 'letter', category: 'two_letter_j', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_jw', symbol: 'jw', type: 'letter', category: 'two_letter_j', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_jx', symbol: 'jx', type: 'letter', category: 'two_letter_j', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_jy', symbol: 'jy', type: 'letter', category: 'two_letter_j', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_jz', symbol: 'jz', type: 'letter', category: 'two_letter_j', visualComplexity: 4, priority: 3, fontSize: 0.75 },

  // ka-kz combinations
  { id: 'letter_ka', symbol: 'ka', type: 'letter', category: 'two_letter_k', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_kb', symbol: 'kb', type: 'letter', category: 'two_letter_k', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_kc', symbol: 'kc', type: 'letter', category: 'two_letter_k', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_kd', symbol: 'kd', type: 'letter', category: 'two_letter_k', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ke', symbol: 'ke', type: 'letter', category: 'two_letter_k', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_kf', symbol: 'kf', type: 'letter', category: 'two_letter_k', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_kg', symbol: 'kg', type: 'letter', category: 'two_letter_k', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_kh', symbol: 'kh', type: 'letter', category: 'two_letter_k', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ki', symbol: 'ki', type: 'letter', category: 'two_letter_k', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_kj', symbol: 'kj', type: 'letter', category: 'two_letter_k', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_kk', symbol: 'kk', type: 'letter', category: 'two_letter_k', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_kl', symbol: 'kl', type: 'letter', category: 'two_letter_k', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_km', symbol: 'km', type: 'letter', category: 'two_letter_k', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_kn', symbol: 'kn', type: 'letter', category: 'two_letter_k', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ko', symbol: 'ko', type: 'letter', category: 'two_letter_k', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_kp', symbol: 'kp', type: 'letter', category: 'two_letter_k', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_kq', symbol: 'kq', type: 'letter', category: 'two_letter_k', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_kr', symbol: 'kr', type: 'letter', category: 'two_letter_k', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ks', symbol: 'ks', type: 'letter', category: 'two_letter_k', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_kt', symbol: 'kt', type: 'letter', category: 'two_letter_k', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ku', symbol: 'ku', type: 'letter', category: 'two_letter_k', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_kv', symbol: 'kv', type: 'letter', category: 'two_letter_k', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_kw', symbol: 'kw', type: 'letter', category: 'two_letter_k', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_kx', symbol: 'kx', type: 'letter', category: 'two_letter_k', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ky', symbol: 'ky', type: 'letter', category: 'two_letter_k', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_kz', symbol: 'kz', type: 'letter', category: 'two_letter_k', visualComplexity: 4, priority: 3, fontSize: 0.75 },

  // la-lz combinations
  { id: 'letter_la', symbol: 'la', type: 'letter', category: 'two_letter_l', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_lb', symbol: 'lb', type: 'letter', category: 'two_letter_l', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_lc', symbol: 'lc', type: 'letter', category: 'two_letter_l', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ld', symbol: 'ld', type: 'letter', category: 'two_letter_l', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_le', symbol: 'le', type: 'letter', category: 'two_letter_l', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_lf', symbol: 'lf', type: 'letter', category: 'two_letter_l', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_lg', symbol: 'lg', type: 'letter', category: 'two_letter_l', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_lh', symbol: 'lh', type: 'letter', category: 'two_letter_l', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_li', symbol: 'li', type: 'letter', category: 'two_letter_l', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_lj', symbol: 'lj', type: 'letter', category: 'two_letter_l', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_lk', symbol: 'lk', type: 'letter', category: 'two_letter_l', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ll', symbol: 'll', type: 'letter', category: 'two_letter_l', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_lm', symbol: 'lm', type: 'letter', category: 'two_letter_l', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ln', symbol: 'ln', type: 'letter', category: 'two_letter_l', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_lo', symbol: 'lo', type: 'letter', category: 'two_letter_l', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_lp', symbol: 'lp', type: 'letter', category: 'two_letter_l', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_lq', symbol: 'lq', type: 'letter', category: 'two_letter_l', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_lr', symbol: 'lr', type: 'letter', category: 'two_letter_l', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ls', symbol: 'ls', type: 'letter', category: 'two_letter_l', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_lt', symbol: 'lt', type: 'letter', category: 'two_letter_l', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_lu', symbol: 'lu', type: 'letter', category: 'two_letter_l', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_lv', symbol: 'lv', type: 'letter', category: 'two_letter_l', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_lw', symbol: 'lw', type: 'letter', category: 'two_letter_l', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_lx', symbol: 'lx', type: 'letter', category: 'two_letter_l', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ly', symbol: 'ly', type: 'letter', category: 'two_letter_l', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_lz', symbol: 'lz', type: 'letter', category: 'two_letter_l', visualComplexity: 4, priority: 3, fontSize: 0.75 },

  // ma-mz combinations
  { id: 'letter_ma', symbol: 'ma', type: 'letter', category: 'two_letter_m', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_mb', symbol: 'mb', type: 'letter', category: 'two_letter_m', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_mc', symbol: 'mc', type: 'letter', category: 'two_letter_m', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_md', symbol: 'md', type: 'letter', category: 'two_letter_m', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_me', symbol: 'me', type: 'letter', category: 'two_letter_m', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_mf', symbol: 'mf', type: 'letter', category: 'two_letter_m', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_mg', symbol: 'mg', type: 'letter', category: 'two_letter_m', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_mh', symbol: 'mh', type: 'letter', category: 'two_letter_m', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_mi', symbol: 'mi', type: 'letter', category: 'two_letter_m', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_mj', symbol: 'mj', type: 'letter', category: 'two_letter_m', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_mk', symbol: 'mk', type: 'letter', category: 'two_letter_m', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ml', symbol: 'ml', type: 'letter', category: 'two_letter_m', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_mm', symbol: 'mm', type: 'letter', category: 'two_letter_m', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_mn', symbol: 'mn', type: 'letter', category: 'two_letter_m', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_mo', symbol: 'mo', type: 'letter', category: 'two_letter_m', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_mp', symbol: 'mp', type: 'letter', category: 'two_letter_m', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_mq', symbol: 'mq', type: 'letter', category: 'two_letter_m', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_mr', symbol: 'mr', type: 'letter', category: 'two_letter_m', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ms', symbol: 'ms', type: 'letter', category: 'two_letter_m', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_mt', symbol: 'mt', type: 'letter', category: 'two_letter_m', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_mu', symbol: 'mu', type: 'letter', category: 'two_letter_m', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_mv', symbol: 'mv', type: 'letter', category: 'two_letter_m', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_mw', symbol: 'mw', type: 'letter', category: 'two_letter_m', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_mx', symbol: 'mx', type: 'letter', category: 'two_letter_m', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_my', symbol: 'my', type: 'letter', category: 'two_letter_m', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_mz', symbol: 'mz', type: 'letter', category: 'two_letter_m', visualComplexity: 4, priority: 3, fontSize: 0.75 },

  // na-nz combinations
  { id: 'letter_na', symbol: 'na', type: 'letter', category: 'two_letter_n', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_nb', symbol: 'nb', type: 'letter', category: 'two_letter_n', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_nc', symbol: 'nc', type: 'letter', category: 'two_letter_n', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_nd', symbol: 'nd', type: 'letter', category: 'two_letter_n', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ne', symbol: 'ne', type: 'letter', category: 'two_letter_n', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_nf', symbol: 'nf', type: 'letter', category: 'two_letter_n', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ng', symbol: 'ng', type: 'letter', category: 'two_letter_n', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_nh', symbol: 'nh', type: 'letter', category: 'two_letter_n', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ni', symbol: 'ni', type: 'letter', category: 'two_letter_n', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_nj', symbol: 'nj', type: 'letter', category: 'two_letter_n', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_nk', symbol: 'nk', type: 'letter', category: 'two_letter_n', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_nl', symbol: 'nl', type: 'letter', category: 'two_letter_n', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_nm', symbol: 'nm', type: 'letter', category: 'two_letter_n', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_nn', symbol: 'nn', type: 'letter', category: 'two_letter_n', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_no', symbol: 'no', type: 'letter', category: 'two_letter_n', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_np', symbol: 'np', type: 'letter', category: 'two_letter_n', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_nq', symbol: 'nq', type: 'letter', category: 'two_letter_n', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_nr', symbol: 'nr', type: 'letter', category: 'two_letter_n', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ns', symbol: 'ns', type: 'letter', category: 'two_letter_n', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_nt', symbol: 'nt', type: 'letter', category: 'two_letter_n', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_nu', symbol: 'nu', type: 'letter', category: 'two_letter_n', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_nv', symbol: 'nv', type: 'letter', category: 'two_letter_n', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_nw', symbol: 'nw', type: 'letter', category: 'two_letter_n', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_nx', symbol: 'nx', type: 'letter', category: 'two_letter_n', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ny', symbol: 'ny', type: 'letter', category: 'two_letter_n', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_nz', symbol: 'nz', type: 'letter', category: 'two_letter_n', visualComplexity: 4, priority: 3, fontSize: 0.75 },

  // oa-oz combinations
  { id: 'letter_oa', symbol: 'oa', type: 'letter', category: 'two_letter_o', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ob', symbol: 'ob', type: 'letter', category: 'two_letter_o', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_oc', symbol: 'oc', type: 'letter', category: 'two_letter_o', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_od', symbol: 'od', type: 'letter', category: 'two_letter_o', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_oe', symbol: 'oe', type: 'letter', category: 'two_letter_o', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_of', symbol: 'of', type: 'letter', category: 'two_letter_o', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_og', symbol: 'og', type: 'letter', category: 'two_letter_o', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_oh', symbol: 'oh', type: 'letter', category: 'two_letter_o', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_oi', symbol: 'oi', type: 'letter', category: 'two_letter_o', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_oj', symbol: 'oj', type: 'letter', category: 'two_letter_o', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ok', symbol: 'ok', type: 'letter', category: 'two_letter_o', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ol', symbol: 'ol', type: 'letter', category: 'two_letter_o', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_om', symbol: 'om', type: 'letter', category: 'two_letter_o', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_on', symbol: 'on', type: 'letter', category: 'two_letter_o', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_oo', symbol: 'oo', type: 'letter', category: 'two_letter_o', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_op', symbol: 'op', type: 'letter', category: 'two_letter_o', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_oq', symbol: 'oq', type: 'letter', category: 'two_letter_o', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_or', symbol: 'or', type: 'letter', category: 'two_letter_o', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_os', symbol: 'os', type: 'letter', category: 'two_letter_o', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ot', symbol: 'ot', type: 'letter', category: 'two_letter_o', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ou', symbol: 'ou', type: 'letter', category: 'two_letter_o', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ov', symbol: 'ov', type: 'letter', category: 'two_letter_o', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ow', symbol: 'ow', type: 'letter', category: 'two_letter_o', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ox', symbol: 'ox', type: 'letter', category: 'two_letter_o', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_oy', symbol: 'oy', type: 'letter', category: 'two_letter_o', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_oz', symbol: 'oz', type: 'letter', category: 'two_letter_o', visualComplexity: 4, priority: 3, fontSize: 0.75 },

  // pa-pz combinations
  { id: 'letter_pa', symbol: 'pa', type: 'letter', category: 'two_letter_p', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_pb', symbol: 'pb', type: 'letter', category: 'two_letter_p', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_pc', symbol: 'pc', type: 'letter', category: 'two_letter_p', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_pd', symbol: 'pd', type: 'letter', category: 'two_letter_p', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_pe', symbol: 'pe', type: 'letter', category: 'two_letter_p', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_pf', symbol: 'pf', type: 'letter', category: 'two_letter_p', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_pg', symbol: 'pg', type: 'letter', category: 'two_letter_p', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ph', symbol: 'ph', type: 'letter', category: 'two_letter_p', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_pi', symbol: 'pi', type: 'letter', category: 'two_letter_p', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_pj', symbol: 'pj', type: 'letter', category: 'two_letter_p', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_pk', symbol: 'pk', type: 'letter', category: 'two_letter_p', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_pl', symbol: 'pl', type: 'letter', category: 'two_letter_p', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_pm', symbol: 'pm', type: 'letter', category: 'two_letter_p', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_pn', symbol: 'pn', type: 'letter', category: 'two_letter_p', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_po', symbol: 'po', type: 'letter', category: 'two_letter_p', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_pp', symbol: 'pp', type: 'letter', category: 'two_letter_p', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_pq', symbol: 'pq', type: 'letter', category: 'two_letter_p', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_pr', symbol: 'pr', type: 'letter', category: 'two_letter_p', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ps', symbol: 'ps', type: 'letter', category: 'two_letter_p', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_pt', symbol: 'pt', type: 'letter', category: 'two_letter_p', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_pu', symbol: 'pu', type: 'letter', category: 'two_letter_p', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_pv', symbol: 'pv', type: 'letter', category: 'two_letter_p', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_pw', symbol: 'pw', type: 'letter', category: 'two_letter_p', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_px', symbol: 'px', type: 'letter', category: 'two_letter_p', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_py', symbol: 'py', type: 'letter', category: 'two_letter_p', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_pz', symbol: 'pz', type: 'letter', category: 'two_letter_p', visualComplexity: 4, priority: 3, fontSize: 0.75 },

  // qa-qz combinations
  { id: 'letter_qa', symbol: 'qa', type: 'letter', category: 'two_letter_q', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_qb', symbol: 'qb', type: 'letter', category: 'two_letter_q', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_qc', symbol: 'qc', type: 'letter', category: 'two_letter_q', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_qd', symbol: 'qd', type: 'letter', category: 'two_letter_q', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_qe', symbol: 'qe', type: 'letter', category: 'two_letter_q', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_qf', symbol: 'qf', type: 'letter', category: 'two_letter_q', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_qg', symbol: 'qg', type: 'letter', category: 'two_letter_q', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_qh', symbol: 'qh', type: 'letter', category: 'two_letter_q', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_qi', symbol: 'qi', type: 'letter', category: 'two_letter_q', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_qj', symbol: 'qj', type: 'letter', category: 'two_letter_q', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_qk', symbol: 'qk', type: 'letter', category: 'two_letter_q', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ql', symbol: 'ql', type: 'letter', category: 'two_letter_q', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_qm', symbol: 'qm', type: 'letter', category: 'two_letter_q', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_qn', symbol: 'qn', type: 'letter', category: 'two_letter_q', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_qo', symbol: 'qo', type: 'letter', category: 'two_letter_q', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_qp', symbol: 'qp', type: 'letter', category: 'two_letter_q', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_qq', symbol: 'qq', type: 'letter', category: 'two_letter_q', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_qr', symbol: 'qr', type: 'letter', category: 'two_letter_q', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_qs', symbol: 'qs', type: 'letter', category: 'two_letter_q', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_qt', symbol: 'qt', type: 'letter', category: 'two_letter_q', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_qu', symbol: 'qu', type: 'letter', category: 'two_letter_q', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_qv', symbol: 'qv', type: 'letter', category: 'two_letter_q', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_qw', symbol: 'qw', type: 'letter', category: 'two_letter_q', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_qx', symbol: 'qx', type: 'letter', category: 'two_letter_q', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_qy', symbol: 'qy', type: 'letter', category: 'two_letter_q', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_qz', symbol: 'qz', type: 'letter', category: 'two_letter_q', visualComplexity: 4, priority: 3, fontSize: 0.75 },

  // ra-rz combinations
  { id: 'letter_ra', symbol: 'ra', type: 'letter', category: 'two_letter_r', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_rb', symbol: 'rb', type: 'letter', category: 'two_letter_r', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_rc', symbol: 'rc', type: 'letter', category: 'two_letter_r', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_rd', symbol: 'rd', type: 'letter', category: 'two_letter_r', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_re', symbol: 're', type: 'letter', category: 'two_letter_r', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_rf', symbol: 'rf', type: 'letter', category: 'two_letter_r', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_rg', symbol: 'rg', type: 'letter', category: 'two_letter_r', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_rh', symbol: 'rh', type: 'letter', category: 'two_letter_r', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ri', symbol: 'ri', type: 'letter', category: 'two_letter_r', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_rj', symbol: 'rj', type: 'letter', category: 'two_letter_r', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_rk', symbol: 'rk', type: 'letter', category: 'two_letter_r', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_rl', symbol: 'rl', type: 'letter', category: 'two_letter_r', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_rm', symbol: 'rm', type: 'letter', category: 'two_letter_r', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_rn', symbol: 'rn', type: 'letter', category: 'two_letter_r', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ro', symbol: 'ro', type: 'letter', category: 'two_letter_r', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_rp', symbol: 'rp', type: 'letter', category: 'two_letter_r', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_rq', symbol: 'rq', type: 'letter', category: 'two_letter_r', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_rr', symbol: 'rr', type: 'letter', category: 'two_letter_r', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_rs', symbol: 'rs', type: 'letter', category: 'two_letter_r', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_rt', symbol: 'rt', type: 'letter', category: 'two_letter_r', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ru', symbol: 'ru', type: 'letter', category: 'two_letter_r', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_rv', symbol: 'rv', type: 'letter', category: 'two_letter_r', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_rw', symbol: 'rw', type: 'letter', category: 'two_letter_r', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_rx', symbol: 'rx', type: 'letter', category: 'two_letter_r', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ry', symbol: 'ry', type: 'letter', category: 'two_letter_r', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_rz', symbol: 'rz', type: 'letter', category: 'two_letter_r', visualComplexity: 4, priority: 3, fontSize: 0.75 },

  // sa-sz combinations
  { id: 'letter_sa', symbol: 'sa', type: 'letter', category: 'two_letter_s', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_sb', symbol: 'sb', type: 'letter', category: 'two_letter_s', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_sc', symbol: 'sc', type: 'letter', category: 'two_letter_s', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_sd', symbol: 'sd', type: 'letter', category: 'two_letter_s', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_se', symbol: 'se', type: 'letter', category: 'two_letter_s', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_sf', symbol: 'sf', type: 'letter', category: 'two_letter_s', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_sg', symbol: 'sg', type: 'letter', category: 'two_letter_s', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_sh', symbol: 'sh', type: 'letter', category: 'two_letter_s', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_si', symbol: 'si', type: 'letter', category: 'two_letter_s', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_sj', symbol: 'sj', type: 'letter', category: 'two_letter_s', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_sk', symbol: 'sk', type: 'letter', category: 'two_letter_s', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_sl', symbol: 'sl', type: 'letter', category: 'two_letter_s', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_sm', symbol: 'sm', type: 'letter', category: 'two_letter_s', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_sn', symbol: 'sn', type: 'letter', category: 'two_letter_s', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_so', symbol: 'so', type: 'letter', category: 'two_letter_s', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_sp', symbol: 'sp', type: 'letter', category: 'two_letter_s', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_sq', symbol: 'sq', type: 'letter', category: 'two_letter_s', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_sr', symbol: 'sr', type: 'letter', category: 'two_letter_s', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ss', symbol: 'ss', type: 'letter', category: 'two_letter_s', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_st', symbol: 'st', type: 'letter', category: 'two_letter_s', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_su', symbol: 'su', type: 'letter', category: 'two_letter_s', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_sv', symbol: 'sv', type: 'letter', category: 'two_letter_s', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_sw', symbol: 'sw', type: 'letter', category: 'two_letter_s', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_sx', symbol: 'sx', type: 'letter', category: 'two_letter_s', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_sy', symbol: 'sy', type: 'letter', category: 'two_letter_s', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_sz', symbol: 'sz', type: 'letter', category: 'two_letter_s', visualComplexity: 4, priority: 3, fontSize: 0.75 },

  // ta-tz combinations
  { id: 'letter_ta', symbol: 'ta', type: 'letter', category: 'two_letter_t', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_tb', symbol: 'tb', type: 'letter', category: 'two_letter_t', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_tc', symbol: 'tc', type: 'letter', category: 'two_letter_t', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_td', symbol: 'td', type: 'letter', category: 'two_letter_t', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_te', symbol: 'te', type: 'letter', category: 'two_letter_t', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_tf', symbol: 'tf', type: 'letter', category: 'two_letter_t', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_tg', symbol: 'tg', type: 'letter', category: 'two_letter_t', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_th', symbol: 'th', type: 'letter', category: 'two_letter_t', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ti', symbol: 'ti', type: 'letter', category: 'two_letter_t', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_tj', symbol: 'tj', type: 'letter', category: 'two_letter_t', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_tk', symbol: 'tk', type: 'letter', category: 'two_letter_t', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_tl', symbol: 'tl', type: 'letter', category: 'two_letter_t', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_tm', symbol: 'tm', type: 'letter', category: 'two_letter_t', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_tn', symbol: 'tn', type: 'letter', category: 'two_letter_t', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_to', symbol: 'to', type: 'letter', category: 'two_letter_t', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_tp', symbol: 'tp', type: 'letter', category: 'two_letter_t', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_tq', symbol: 'tq', type: 'letter', category: 'two_letter_t', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_tr', symbol: 'tr', type: 'letter', category: 'two_letter_t', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ts', symbol: 'ts', type: 'letter', category: 'two_letter_t', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_tt', symbol: 'tt', type: 'letter', category: 'two_letter_t', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_tu', symbol: 'tu', type: 'letter', category: 'two_letter_t', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_tv', symbol: 'tv', type: 'letter', category: 'two_letter_t', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_tw', symbol: 'tw', type: 'letter', category: 'two_letter_t', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_tx', symbol: 'tx', type: 'letter', category: 'two_letter_t', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ty', symbol: 'ty', type: 'letter', category: 'two_letter_t', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_tz', symbol: 'tz', type: 'letter', category: 'two_letter_t', visualComplexity: 4, priority: 3, fontSize: 0.75 },

  // ua-uz combinations
  { id: 'letter_ua', symbol: 'ua', type: 'letter', category: 'two_letter_u', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ub', symbol: 'ub', type: 'letter', category: 'two_letter_u', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_uc', symbol: 'uc', type: 'letter', category: 'two_letter_u', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ud', symbol: 'ud', type: 'letter', category: 'two_letter_u', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ue', symbol: 'ue', type: 'letter', category: 'two_letter_u', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_uf', symbol: 'uf', type: 'letter', category: 'two_letter_u', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ug', symbol: 'ug', type: 'letter', category: 'two_letter_u', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_uh', symbol: 'uh', type: 'letter', category: 'two_letter_u', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ui', symbol: 'ui', type: 'letter', category: 'two_letter_u', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_uj', symbol: 'uj', type: 'letter', category: 'two_letter_u', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_uk', symbol: 'uk', type: 'letter', category: 'two_letter_u', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ul', symbol: 'ul', type: 'letter', category: 'two_letter_u', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_um', symbol: 'um', type: 'letter', category: 'two_letter_u', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_un', symbol: 'un', type: 'letter', category: 'two_letter_u', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_uo', symbol: 'uo', type: 'letter', category: 'two_letter_u', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_up', symbol: 'up', type: 'letter', category: 'two_letter_u', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_uq', symbol: 'uq', type: 'letter', category: 'two_letter_u', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ur', symbol: 'ur', type: 'letter', category: 'two_letter_u', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_us', symbol: 'us', type: 'letter', category: 'two_letter_u', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ut', symbol: 'ut', type: 'letter', category: 'two_letter_u', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_uu', symbol: 'uu', type: 'letter', category: 'two_letter_u', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_uv', symbol: 'uv', type: 'letter', category: 'two_letter_u', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_uw', symbol: 'uw', type: 'letter', category: 'two_letter_u', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ux', symbol: 'ux', type: 'letter', category: 'two_letter_u', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_uy', symbol: 'uy', type: 'letter', category: 'two_letter_u', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_uz', symbol: 'uz', type: 'letter', category: 'two_letter_u', visualComplexity: 4, priority: 3, fontSize: 0.75 },

  // va-vz combinations
  { id: 'letter_va', symbol: 'va', type: 'letter', category: 'two_letter_v', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_vb', symbol: 'vb', type: 'letter', category: 'two_letter_v', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_vc', symbol: 'vc', type: 'letter', category: 'two_letter_v', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_vd', symbol: 'vd', type: 'letter', category: 'two_letter_v', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ve', symbol: 've', type: 'letter', category: 'two_letter_v', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_vf', symbol: 'vf', type: 'letter', category: 'two_letter_v', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_vg', symbol: 'vg', type: 'letter', category: 'two_letter_v', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_vh', symbol: 'vh', type: 'letter', category: 'two_letter_v', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_vi', symbol: 'vi', type: 'letter', category: 'two_letter_v', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_vj', symbol: 'vj', type: 'letter', category: 'two_letter_v', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_vk', symbol: 'vk', type: 'letter', category: 'two_letter_v', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_vl', symbol: 'vl', type: 'letter', category: 'two_letter_v', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_vm', symbol: 'vm', type: 'letter', category: 'two_letter_v', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_vn', symbol: 'vn', type: 'letter', category: 'two_letter_v', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_vo', symbol: 'vo', type: 'letter', category: 'two_letter_v', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_vp', symbol: 'vp', type: 'letter', category: 'two_letter_v', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_vq', symbol: 'vq', type: 'letter', category: 'two_letter_v', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_vr', symbol: 'vr', type: 'letter', category: 'two_letter_v', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_vs', symbol: 'vs', type: 'letter', category: 'two_letter_v', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_vt', symbol: 'vt', type: 'letter', category: 'two_letter_v', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_vu', symbol: 'vu', type: 'letter', category: 'two_letter_v', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_vv', symbol: 'vv', type: 'letter', category: 'two_letter_v', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_vw', symbol: 'vw', type: 'letter', category: 'two_letter_v', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_vx', symbol: 'vx', type: 'letter', category: 'two_letter_v', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_vy', symbol: 'vy', type: 'letter', category: 'two_letter_v', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_vz', symbol: 'vz', type: 'letter', category: 'two_letter_v', visualComplexity: 4, priority: 3, fontSize: 0.75 },

  // wa-wz combinations
  { id: 'letter_wa', symbol: 'wa', type: 'letter', category: 'two_letter_w', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_wb', symbol: 'wb', type: 'letter', category: 'two_letter_w', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_wc', symbol: 'wc', type: 'letter', category: 'two_letter_w', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_wd', symbol: 'wd', type: 'letter', category: 'two_letter_w', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_we', symbol: 'we', type: 'letter', category: 'two_letter_w', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_wf', symbol: 'wf', type: 'letter', category: 'two_letter_w', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_wg', symbol: 'wg', type: 'letter', category: 'two_letter_w', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_wh', symbol: 'wh', type: 'letter', category: 'two_letter_w', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_wi', symbol: 'wi', type: 'letter', category: 'two_letter_w', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_wj', symbol: 'wj', type: 'letter', category: 'two_letter_w', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_wk', symbol: 'wk', type: 'letter', category: 'two_letter_w', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_wl', symbol: 'wl', type: 'letter', category: 'two_letter_w', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_wm', symbol: 'wm', type: 'letter', category: 'two_letter_w', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_wn', symbol: 'wn', type: 'letter', category: 'two_letter_w', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_wo', symbol: 'wo', type: 'letter', category: 'two_letter_w', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_wp', symbol: 'wp', type: 'letter', category: 'two_letter_w', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_wq', symbol: 'wq', type: 'letter', category: 'two_letter_w', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_wr', symbol: 'wr', type: 'letter', category: 'two_letter_w', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ws', symbol: 'ws', type: 'letter', category: 'two_letter_w', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_wt', symbol: 'wt', type: 'letter', category: 'two_letter_w', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_wu', symbol: 'wu', type: 'letter', category: 'two_letter_w', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_wv', symbol: 'wv', type: 'letter', category: 'two_letter_w', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_ww', symbol: 'ww', type: 'letter', category: 'two_letter_w', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_wx', symbol: 'wx', type: 'letter', category: 'two_letter_w', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_wy', symbol: 'wy', type: 'letter', category: 'two_letter_w', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_wz', symbol: 'wz', type: 'letter', category: 'two_letter_w', visualComplexity: 4, priority: 3, fontSize: 0.75 },

  // xa-xz combinations
  { id: 'letter_xa', symbol: 'xa', type: 'letter', category: 'two_letter_x', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_xb', symbol: 'xb', type: 'letter', category: 'two_letter_x', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_xc', symbol: 'xc', type: 'letter', category: 'two_letter_x', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_xd', symbol: 'xd', type: 'letter', category: 'two_letter_x', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_xe', symbol: 'xe', type: 'letter', category: 'two_letter_x', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_xf', symbol: 'xf', type: 'letter', category: 'two_letter_x', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_xg', symbol: 'xg', type: 'letter', category: 'two_letter_x', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_xh', symbol: 'xh', type: 'letter', category: 'two_letter_x', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_xi', symbol: 'xi', type: 'letter', category: 'two_letter_x', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_xj', symbol: 'xj', type: 'letter', category: 'two_letter_x', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_xk', symbol: 'xk', type: 'letter', category: 'two_letter_x', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_xl', symbol: 'xl', type: 'letter', category: 'two_letter_x', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_xm', symbol: 'xm', type: 'letter', category: 'two_letter_x', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_xn', symbol: 'xn', type: 'letter', category: 'two_letter_x', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_xo', symbol: 'xo', type: 'letter', category: 'two_letter_x', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_xp', symbol: 'xp', type: 'letter', category: 'two_letter_x', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_xq', symbol: 'xq', type: 'letter', category: 'two_letter_x', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_xr', symbol: 'xr', type: 'letter', category: 'two_letter_x', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_xs', symbol: 'xs', type: 'letter', category: 'two_letter_x', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_xt', symbol: 'xt', type: 'letter', category: 'two_letter_x', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_xu', symbol: 'xu', type: 'letter', category: 'two_letter_x', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_xv', symbol: 'xv', type: 'letter', category: 'two_letter_x', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_xw', symbol: 'xw', type: 'letter', category: 'two_letter_x', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_xx', symbol: 'xx', type: 'letter', category: 'two_letter_x', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_xy', symbol: 'xy', type: 'letter', category: 'two_letter_x', visualComplexity: 4, priority: 3, fontSize: 0.75 },
  { id: 'letter_xz', symbol: 'xz', type: 'letter', category: 'two_letter_x', visualComplexity: 4, priority: 3, fontSize: 0.75 }
]

/**
 * Calculate visual similarity between two icons
 * Returns a score from 0 (completely different) to 1 (very similar)
 * ENHANCED: Now includes priority-based similarity and better category matching
 */
function calculateIconSimilarity(icon1: Icon, icon2: Icon): number {
  let similarity = 0

  // EXACT category match = very high similarity (problematic pairs)
  if (icon1.category === icon2.category) {
    similarity += 0.6
  }

  // Same type = moderate similarity
  if (icon1.type === icon2.type) {
    similarity += 0.3
  }

  // Same priority level = slight similarity
  if (icon1.priority === icon2.priority) {
    similarity += 0.1
  }

  // Similar visual complexity = slight similarity
  const complexityDiff = Math.abs(icon1.visualComplexity - icon2.visualComplexity)
  if (complexityDiff <= 1) {
    similarity += 0.15
  }

  // SPECIAL CASES: Specific problematic combinations
  // Numbers that look similar
  const numSimilarPairs = [
    ['0', '8'], ['6', '9'], ['1', 'I'], ['0', 'O'], ['5', 'S']
  ]
  for (const [a, b] of numSimilarPairs) {
    if ((icon1.symbol === a && icon2.symbol === b) || (icon1.symbol === b && icon2.symbol === a)) {
      similarity += 0.4
    }
  }

  // Letters that look similar  
  const letterSimilarPairs = [
    ['O', '0'], ['I', '1'], ['S', '5'], ['B', '8'], ['G', '6'], ['Ο', 'O'], ['Ο', '0'], ['Ι', 'I'], ['Α', 'A'], ['Β', 'B'], ['Ε', 'E'], ['Ζ', 'Z'], ['Η', 'H'], ['Κ', 'K'], ['Μ', 'M'], ['Ν', 'N'], ['Ρ', 'P'], ['Τ', 'T'], ['Υ', 'Y']
  ]
  for (const [a, b] of letterSimilarPairs) {
    if ((icon1.symbol === a && icon2.symbol === b) || (icon1.symbol === b && icon2.symbol === a)) {
      similarity += 0.4
    }
  }

  // Special characters that look similar to other symbols
  const specialSimilarPairs = [
    ['×', 'X'], ['×', '+'], ['✓', '√'], ['◆', '◇'], ['◉', '◎'], ['←', '→']
  ]
  for (const [a, b] of specialSimilarPairs) {
    if ((icon1.symbol === a && icon2.symbol === b) || (icon1.symbol === b && icon2.symbol === a)) {
      similarity += 0.3
    }
  }
  
  // Two-digit numbers that might be visually confusing
  const doubleDigitSimilarPairs = [
    ['10', '16'], ['11', '17'], ['18', '19'], ['20', '28'], ['22', '33'],
    ['25', '35'], ['38', '39'], ['44', '49'], ['46', '48'], ['13', '31']
  ]
  for (const [a, b] of doubleDigitSimilarPairs) {
    if ((icon1.symbol === a && icon2.symbol === b) || (icon1.symbol === b && icon2.symbol === a)) {
      similarity += 0.2
    }
  }

  return Math.min(similarity, 1)
}

/**
 * Check if two icons are too similar to be placed adjacent to each other
 */
function areIconsTooSimilar(icon1: Icon, icon2: Icon): boolean {
  const similarity = calculateIconSimilarity(icon1, icon2)
  return similarity > 0.6 // Threshold for "too similar"
}

/**
 * Get adjacent positions for a given coordinate
 */
function getAdjacentPositions(x: number, y: number, gridWidth: number, gridHeight: number): Array<{ x: number; y: number }> {
  const adjacent = []
  
  // 8-directional adjacency (including diagonals)
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue // Skip center
      
      const newX = x + dx
      const newY = y + dy
      
      if (newX >= 0 && newX < gridWidth && newY >= 0 && newY < gridHeight) {
        adjacent.push({ x: newX, y: newY })
      }
    }
  }
  
  return adjacent
}

/**
 * ENHANCED Smart icon assignment algorithm with priority-based selection
 * Ensures high readability by assigning better icons to frequently used colors
 */
export function assignIconsToColors(
  dmcCodes: string[],
  patternGrid: Array<Array<string>>, // DMC codes at each position
  maxColors: number = AVAILABLE_ICONS.length
): Map<string, Icon> {
  // 🚀 CACHE CHECK: 동일한 색상 조합이면 캐시된 결과 반환
  const cacheKey = createCacheKey(dmcCodes, patternGrid[0]?.length || 0, patternGrid.length)
  const cachedResult = ICON_ASSIGNMENT_CACHE.get(cacheKey)
  
  if (cachedResult) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`💡 Cache hit! Reusing icon assignments for ${dmcCodes.length} colors`)
    }
    return new Map(cachedResult) // 새 Map 인스턴스 반환
  }
  
  const assignments = new Map<string, Icon>()
  const usedIcons = new Set<string>()
  
  // Calculate usage frequency for each color
  const colorUsage = new Map<string, number>()
  for (const row of patternGrid) {
    for (const dmcCode of row) {
      colorUsage.set(dmcCode, (colorUsage.get(dmcCode) || 0) + 1)
    }
  }
  
  // Sort DMC codes by usage frequency (most used first)
  const sortedCodes = dmcCodes.sort((a, b) => {
    const usageA = colorUsage.get(a) || 0
    const usageB = colorUsage.get(b) || 0
    return usageB - usageA
  })

  // Sort available icons by priority (numbers first, then shapes, etc.)
  const sortedIcons = [...AVAILABLE_ICONS].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority
    return a.visualComplexity - b.visualComplexity // Simpler first within same priority
  })

  // For each DMC color (most used first), find the best available icon
  for (const dmcCode of sortedCodes) {
    let bestIcon: Icon | null = null
    let lowestScore = Infinity
    const usageFrequency = colorUsage.get(dmcCode) || 0

    // Try each available icon (prioritized by readability)
    for (const icon of sortedIcons) {
      if (usedIcons.has(icon.id)) continue

      // Calculate comprehensive score (lower = better)
      let score = 0
      
      // CONFLICT DETECTION: Check all positions where this color appears
      let conflictCount = 0
      for (let y = 0; y < patternGrid.length; y++) {
        for (let x = 0; x < patternGrid[y].length; x++) {
          if (patternGrid[y][x] !== dmcCode) continue

          const adjacent = getAdjacentPositions(x, y, patternGrid[0].length, patternGrid.length)
          
          for (const adjPos of adjacent) {
            const adjDmcCode = patternGrid[adjPos.y][adjPos.x]
            const adjIcon = assignments.get(adjDmcCode)
            
            if (adjIcon && areIconsTooSimilar(icon, adjIcon)) {
              conflictCount += 1
            }
          }
        }
      }

      // SCORING SYSTEM (lower scores are better)
      score += conflictCount * 100  // Heavy penalty for conflicts
      score += icon.priority * 10   // Prefer lower priority (numbers > shapes > letters > special)
      score += icon.visualComplexity * 5 // Prefer simpler icons
      
      // USAGE BONUS: Give huge bonus to high-priority icons for frequently used colors
      const usageBonus = usageFrequency / 10 // Normalize usage
      if (icon.priority === 1) score -= usageBonus * 20 // Numbers get big bonus
      else if (icon.priority === 2) score -= usageBonus * 10 // Shapes get medium bonus
      else if (icon.priority === 3) score -= usageBonus * 5  // Letters get small bonus

      if (score < lowestScore) {
        lowestScore = score
        bestIcon = icon
      }
    }

    // Assign the best icon found
    if (bestIcon) {
      assignments.set(dmcCode, bestIcon)
      usedIcons.add(bestIcon.id)
      const fontInfo = bestIcon.isDoubleDigit ? ` fontSize:${bestIcon.fontSize}` : ''
      // 개발 환경에서만 상세 로그 출력
      if (process.env.NODE_ENV === 'development') {
        console.log(`🎯 Assigned ${bestIcon.symbol} (priority ${bestIcon.priority}${fontInfo}) to DMC ${dmcCode} (${usageFrequency} uses)`)
      }
    } else {
      // Emergency fallback: use any remaining icon
      const remainingIcons = sortedIcons.filter(icon => !usedIcons.has(icon.id))
      if (remainingIcons.length > 0) {
        const fallbackIcon = remainingIcons[0]
        assignments.set(dmcCode, fallbackIcon)
        usedIcons.add(fallbackIcon.id)
        const fontInfo = fallbackIcon.isDoubleDigit ? ` fontSize:${fallbackIcon.fontSize}` : ''
        if (process.env.NODE_ENV === 'development') {
          console.warn(`⚠️ Fallback: Assigned ${fallbackIcon.symbol} (${fontInfo}) to DMC ${dmcCode}`)
        }
      }
    }

    if (usedIcons.size >= AVAILABLE_ICONS.length) break
  }

  // 🚀 CACHE STORE: 결과를 캐시에 저장
  ICON_ASSIGNMENT_CACHE.set(cacheKey, new Map(assignments))
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ Icon assignment completed: ${assignments.size} colors assigned`)
    console.log(`💾 Cached icon assignments for future reuse (key: ${cacheKey.slice(0, 50)}...)`)
  }
  
  return assignments
}

/**
 * Validate icon assignments by checking for adjacent conflicts
 */
export function validateIconAssignments(
  assignments: Map<string, Icon>,
  patternGrid: Array<Array<string>>
): {
  isValid: boolean
  conflicts: Array<{
    position: { x: number; y: number }
    dmcCode1: string
    dmcCode2: string
    icon1: Icon
    icon2: Icon
    similarity: number
  }>
} {
  const conflicts = []

  for (let y = 0; y < patternGrid.length; y++) {
    for (let x = 0; x < patternGrid[y].length; x++) {
      const dmcCode1 = patternGrid[y][x]
      const icon1 = assignments.get(dmcCode1)
      if (!icon1) continue

      const adjacent = getAdjacentPositions(x, y, patternGrid[0].length, patternGrid.length)
      
      for (const adjPos of adjacent) {
        const dmcCode2 = patternGrid[adjPos.y][adjPos.x]
        const icon2 = assignments.get(dmcCode2)
        if (!icon2 || dmcCode1 === dmcCode2) continue

        if (areIconsTooSimilar(icon1, icon2)) {
          const similarity = calculateIconSimilarity(icon1, icon2)
          conflicts.push({
            position: { x, y },
            dmcCode1,
            dmcCode2,
            icon1,
            icon2,
            similarity
          })
        }
      }
    }
  }

  return {
    isValid: conflicts.length === 0,
    conflicts
  }
}

/**
 * Get statistics about icon assignments
 */
export function getIconAssignmentStats(
  assignments: Map<string, Icon>,
  patternGrid: Array<Array<string>>
): {
  totalColors: number
  iconsUsed: number
  averageComplexity: number
  typeDistribution: Record<string, number>
  conflictCount: number
} {
  const validation = validateIconAssignments(assignments, patternGrid)
  const icons = Array.from(assignments.values())
  
  const typeDistribution: Record<string, number> = {}
  let totalComplexity = 0
  
  for (const icon of icons) {
    typeDistribution[icon.type] = (typeDistribution[icon.type] || 0) + 1
    totalComplexity += icon.visualComplexity
  }

  return {
    totalColors: assignments.size,
    iconsUsed: icons.length,
    averageComplexity: totalComplexity / icons.length,
    typeDistribution,
    conflictCount: validation.conflicts.length
  }
}

/**
 * TESTING FUNCTION: Generate icon assignment report
 */
export function generateIconAssignmentReport(
  assignments: Map<string, Icon>,
  patternGrid: Array<Array<string>>
): string {
  const stats = getIconAssignmentStats(assignments, patternGrid)
  const validation = validateIconAssignments(assignments, patternGrid)
  
  let report = '🎯 ENHANCED ICON ASSIGNMENT REPORT\n'
  report += '=====================================\n\n'
  
  report += `📊 STATISTICS:\n`
  report += `   • Total Colors: ${stats.totalColors}\n`
  report += `   • Icons Used: ${stats.iconsUsed}/${AVAILABLE_ICONS.length}\n`
  report += `   • Average Complexity: ${stats.averageComplexity.toFixed(2)}\n`
  report += `   • Conflicts Found: ${stats.conflictCount}\n\n`
  
  report += `📈 TYPE DISTRIBUTION:\n`
  Object.entries(stats.typeDistribution).forEach(([type, count]) => {
    report += `   • ${type}: ${count} icons\n`
  })
  
  if (validation.conflicts.length > 0) {
    report += `\n⚠️  CONFLICTS DETECTED:\n`
    validation.conflicts.slice(0, 5).forEach(conflict => {
      report += `   • Position (${conflict.position.x},${conflict.position.y}): `
      report += `${conflict.icon1.symbol}(${conflict.dmcCode1}) vs ${conflict.icon2.symbol}(${conflict.dmcCode2}) `
      report += `(similarity: ${(conflict.similarity * 100).toFixed(1)}%)\n`
    })
    if (validation.conflicts.length > 5) {
      report += `   ... and ${validation.conflicts.length - 5} more conflicts\n`
    }
  } else {
    report += `\n✅ NO CONFLICTS DETECTED - Perfect assignment!\n`
  }
  
  return report
}