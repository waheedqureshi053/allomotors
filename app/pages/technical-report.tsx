import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { formatNODecimal } from '@/utils/helperFunction';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSearchParams } from 'expo-router/build/hooks';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ImageStyle,
    ScrollView,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    useColorScheme,
    View,
    ViewStyle
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGlobalStyles } from '../_styles/globalStyle';

const { width } = Dimensions.get('window');


// ─── Types ────────────────────────────────────────────────────────────────────
interface ReportSection {
    [key: string]: string | any[];
}

interface TechReport {
    Engine: ReportSection;
    Tires: ReportSection;
    Lighting: ReportSection;
    Glass: ReportSection;
    Interior: ReportSection;
    Body: ReportSection;
    Maintenance: ReportSection;
}

interface Advert {
    title: string;
    reference: string;
    vehicleType: string;
    sellingPrice: number;
    hidePrice: boolean;
    reportStatus: string;
    imageUrl: string;
    thumbnails: string[];
    inspectionOfficer: string;
    inspectionDate: string;
    techReport: TechReport;
}

interface SectionConfig {
    key: keyof TechReport;
    label: string;
    color: string;
    icon: string;
    items: { label: string; key: string }[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_ADVERT: Advert = {
    title: 'Toyota Corolla 2021',
    reference: 'AM-2024-00129',
    vehicleType: '🚗 Sedan',
    sellingPrice: 18500,
    hidePrice: false,
    reportStatus: 'Verified',
    imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&q=80',
    thumbnails: [
        'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=200&q=60',
        'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=200&q=60',
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=200&q=60',
    ],
    inspectionOfficer: 'Youssef Amine',
    inspectionDate: '12 April 2025',
    techReport: {
        Engine: {
            EngineSealing: 'Bon', EngineSealingRemarks: '',
            EngineOil: 'Bon', EngineOilRemarks: 'Niveau correct',
            CoolantFluid: 'Bon', CoolantFluidRemarks: '',
            BrakeFluid: 'Moyen', BrakeFluidRemarks: 'À surveiller',
            PowerSteering: 'Bon', PowerSteeringRemarks: '',
            HosesCondition: 'Bon', HosesConditionRemarks: '',
            WiringHarness: 'Bon', WiringHarnessRemarks: '',
            BatteryCondition: 'Bon', BatteryConditionRemarks: '12V OK',
            EngineNoise: 'Bon', EngineNoiseRemarks: '',
        },
        Tires: {
            FrontRightTire: 'Bon', FrontRightTireRemarks: '',
            FrontLeftTire: 'Bon', FrontLeftTireRemarks: '',
            RearRightTire: 'Moyen', RearRightTireRemarks: 'Usure légère',
            RearLeftTire: 'Bon', RearLeftTireRemarks: '',
            SameBrandPerAxle: 'Oui', SameBrandPerAxleRemarks: '',
            ConditionOfRims: 'Bon', ConditionOfRimsRemarks: '',
        },
        Lighting: {
            FrontLights: 'Bon', FrontLightsRemarks: '',
            FrontIndicators: 'Bon', FrontIndicatorsRemarks: '',
            RearLights: 'Bon', RearLightsRemarks: '',
            RearIndicators: 'Bon', RearIndicatorsRemarks: '',
            StopLight: 'Bon', StopLightRemarks: '',
            FogLight: 'Mauvais', FogLightRemarks: 'Ampoule grillée',
        },
        Glass: {
            Windshield: 'Bon', WindshieldRemarks: '',
            RearWindow: 'Bon', RearWindowRemarks: '',
            RightSideWindow: 'Bon', RightSideWindowRemarks: '',
            LeftSideWindow: 'Bon', LeftSideWindowRemarks: '',
            InnerMirror: 'Bon', InnerMirrorRemarks: '',
            OuterMirror: 'Bon', OuterMirrorRemarks: '',
            WiperCondition: 'Moyen', WiperConditionRemarks: 'À remplacer',
            WiperFunctional: 'Oui', WiperFunctionalRemarks: '',
            WasherJet: 'Oui', WasherJetRemarks: '',
        },
        Interior: {
            SeatCondition: 'Bon', SeatConditionRemarks: '',
            SeatbeltCondition: 'Bon', SeatbeltConditionRemarks: '',
            SteeringWheel: 'Bon', SteeringWheelRemarks: '',
            DashboardCondition: 'Bon', DashboardConditionRemarks: '',
            DashboardIndicators: 'Bon', DashboardIndicatorsRemarks: 'Aucun voyant',
            AirConditioning: 'Bon', AirConditioningRemarks: '',
            Blower: 'Bon', BlowerRemarks: '',
            Display: 'Bon', DisplayRemarks: '',
            RadarCamera: 'Bon', RadarCameraRemarks: '',
            Horn: 'Bon', HornRemarks: '',
            CentralLocking: 'Bon', CentralLockingRemarks: '',
        },
        Body: {
            GeneralCondition: 'Bon', GeneralConditionRemarks: '',
            FrontBumper: 'Bon', FrontBumperRemarks: '',
            Hood: 'Bon', HoodRemarks: '',
            Grille: 'Bon', GrilleRemarks: '',
            Roof: 'Bon', RoofRemarks: '',
            FrontRightWing: 'Moyen', FrontRightWingRemarks: 'Légère rayure',
            RightDoors: 'Bon', RightDoorsRemarks: '',
            RightSill: 'Bon', RightSillRemarks: '',
            RearRightWing: 'Bon', RearRightWingRemarks: '',
            RearBumper: 'Bon', RearBumperRemarks: '',
            BootTailgate: 'Bon', BootTailgateRemarks: '',
            RearLeftWing: 'Bon', RearLeftWingRemarks: '',
            LeftSill: 'Bon', LeftSillRemarks: '',
            LeftDoors: 'Bon', LeftDoorsRemarks: '',
            FrontLeftWing: 'Bon', FrontLeftWingRemarks: '',
        },
        Maintenance: {
            UpToDate: 'Oui', UpToDateRemarks: '',
            TimingBelt: 'Bon', TimingBeltRemarks: 'Changée à 80 000 km',
            GearboxOilChange: 'Oui', GearboxOilChangeRemarks: '',
            SpareKey: 'Oui', SpareKeyRemarks: '',
            RoadworthinessTest: 'Valide', RoadworthinessTestRemarks: "Valide jusqu'à 12/2025",
        },
    },
};

// ─── Section Configs ──────────────────────────────────────────────────────────
const SECTIONS: SectionConfig[] = [
    {
        key: 'Maintenance', label: 'Informations Véhicule', color: '#6a1b9a', icon: '📋',
        items: [
            { label: 'Révision à jour', key: 'UpToDate' },
            { label: 'Distribution', key: 'TimingBelt' },
            { label: 'Vidange boîte', key: 'GearboxOilChange' },
            { label: 'Double de clé', key: 'SpareKey' },
            { label: 'Contrôle technique', key: 'RoadworthinessTest' },
        ],
    },
    {
        key: 'Engine', label: 'Compartiment Moteur', color: '#e53935', icon: '🔧',
        items: [
            { label: 'Étanchéité moteur', key: 'EngineSealing' },
            { label: 'Huile moteur', key: 'EngineOil' },
            { label: 'Liquide refroidissement', key: 'CoolantFluid' },
            { label: 'Liquide de frein', key: 'BrakeFluid' },
            { label: 'Direction assistée', key: 'PowerSteering' },
            { label: 'État des durites', key: 'HosesCondition' },
            { label: 'État des faisceaux', key: 'WiringHarness' },
            { label: 'État batterie', key: 'BatteryCondition' },
            { label: 'Bruit moteur', key: 'EngineNoise' },
        ],
    },
    {
        key: 'Tires', label: 'Pneus', color: '#212121', icon: '⚙️',
        items: [
            { label: 'Pneu Avant Droit', key: 'FrontRightTire' },
            { label: 'Pneu Avant Gauche', key: 'FrontLeftTire' },
            { label: 'Pneu Arrière Droit', key: 'RearRightTire' },
            { label: 'Pneu Arrière Gauche', key: 'RearLeftTire' },
            { label: 'Même marque / essieu', key: 'SameBrandPerAxle' },
            { label: 'État des jantes', key: 'ConditionOfRims' },
        ],
    },
    {
        key: 'Lighting', label: 'Éclairage', color: '#f9a825', icon: '💡',
        items: [
            { label: 'Feux Avant', key: 'FrontLights' },
            { label: 'Clignotants Avant', key: 'FrontIndicators' },
            { label: 'Feux Arrière', key: 'RearLights' },
            { label: 'Clignotants Arrière', key: 'RearIndicators' },
            { label: 'Feu Stop', key: 'StopLight' },
            { label: 'Antibrouillard', key: 'FogLight' },
        ],
    },
    {
        key: 'Glass', label: 'Vitrage', color: '#0288d1', icon: '🪟',
        items: [
            { label: 'Pare-brise', key: 'Windshield' },
            { label: 'Lunette arrière', key: 'RearWindow' },
            { label: 'Vitre droite', key: 'RightSideWindow' },
            { label: 'Vitre gauche', key: 'LeftSideWindow' },
            { label: 'Rétro intérieur', key: 'InnerMirror' },
            { label: 'Rétro extérieur', key: 'OuterMirror' },
            { label: 'État essuie-glace', key: 'WiperCondition' },
            { label: 'Essuie-glace fonctionnel', key: 'WiperFunctional' },
            { label: 'Gicleur', key: 'WasherJet' },
        ],
    },
    {
        key: 'Interior', label: 'Habitacle', color: '#2e7d32', icon: '🪑',
        items: [
            { label: 'État des sièges', key: 'SeatCondition' },
            { label: 'Ceintures', key: 'SeatbeltCondition' },
            { label: 'Volant', key: 'SteeringWheel' },
            { label: 'Tableau de bord', key: 'DashboardCondition' },
            { label: 'Voyants', key: 'DashboardIndicators' },
            { label: 'Climatisation', key: 'AirConditioning' },
            { label: 'Soufflerie', key: 'Blower' },
            { label: 'Écran', key: 'Display' },
            { label: 'Radar / Caméra', key: 'RadarCamera' },
            { label: 'Klaxon', key: 'Horn' },
            { label: 'Verrouillage centralisé', key: 'CentralLocking' },
        ],
    },
    {
        key: 'Body', label: 'Carrosserie', color: '#546e7a', icon: '🚘',
        items: [
            { label: 'État général', key: 'GeneralCondition' },
            { label: 'Pare-choc avant', key: 'FrontBumper' },
            { label: 'Capot', key: 'Hood' },
            { label: 'Calandre', key: 'Grille' },
            { label: 'Pavillon', key: 'Roof' },
            { label: 'Aile Avant Droite', key: 'FrontRightWing' },
            { label: 'Portes droites', key: 'RightDoors' },
            { label: 'Bas de caisse droit', key: 'RightSill' },
            { label: 'Aile Arrière Droite', key: 'RearRightWing' },
            { label: 'Pare-choc arrière', key: 'RearBumper' },
            { label: 'Hayon / Coffre', key: 'BootTailgate' },
            { label: 'Aile Arrière Gauche', key: 'RearLeftWing' },
            { label: 'Bas de caisse gauche', key: 'LeftSill' },
            { label: 'Portes gauches', key: 'LeftDoors' },
            { label: 'Aile Avant Gauche', key: 'FrontLeftWing' },
        ],
    },
    
];

// ─── Main Screen ──────────────────────────────────────────────────────────────
interface Props {
    navigation?: { goBack: () => void };
    advert?: Advert;
}

export default function TechnicalReportScreen({ navigation, advert = MOCK_ADVERT }: Props) {
    const [selectedThumb, setSelectedThumb] = useState<string>(advert.imageUrl);
    const reportBadge = getReportBadgeColors(advert.reportStatus);
    const theme = useColorScheme();
    const { styles, FONT_SIZES } = useGlobalStyles();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const params = useSearchParams();
    const id = params.get("id");
    const page = params.get("page");
    const item = params.get("item") ? JSON.parse(params.get("item") as string)?.ItemGuid : null;
    const [parsedData, setparsedData] = useState<any>();
    const BASE_URL = 'https://dev.allomotors.fr/Content/Webdata/UF/';

    const GetAdvert = async (id: any) => {
        const baseURL = 'https://allomotors.fr/Content/WebData/Sign/';
        let data = item ? JSON.parse(params.get("item") as string) : null;
        data.TechReport = data.TechReport ? JSON.parse(data.TechReport) : null;
        if (data?.TechReport?.EmpSignURL)
            data.TechReport.EmpSignURL = `${baseURL}${data?.TechReport.EmpSignURL}`;
        setparsedData(data);
        console.log('parsedData :', parsedData);
    };

    useEffect(() => {
        console.log('itemGuid :', id);
        GetAdvert(id);
    }, [id]);

    // ─── Helpers ──────────────────────────────────────────────────────────────────
    interface StatusColors { bg: string; text: string; dot: string }

    function getStatusColors(value: string): StatusColors {
        const v = (value || '').toLowerCase();
        if (['bon', 'good', 'oui', 'yes', 'valide', 'valid'].includes(v))
            return { bg: '#e8f5e9', text: '#1b5e20', dot: '#43a047' };
        if (['moyen', 'average'].includes(v))
            return { bg: '#fff8e1', text: '#f57f17', dot: '#fbc02d' };
        if (['mauvais', 'bad', 'non', 'no', 'expiré', 'expired'].includes(v))
            return { bg: '#ffebee', text: '#b71c1c', dot: '#e53935' };
        return { bg: '#f5f5f5', text: '#616161', dot: '#9e9e9e' };
    }

    function getReportBadgeColors(status: string): { bg: string; text: string } {
        const map: Record<string, { bg: string; text: string }> = {
            Verified: { bg: '#e8f5e9', text: '#2e7d32' },
            'Inspection Completed': { bg: '#e3f2fd', text: '#1565c0' },
            'Report Generated': { bg: '#ede7f6', text: '#4527a0' },
            'Contract Sent': { bg: '#e3f2fd', text: '#1565c0' },
            'Waiting for Signature': { bg: '#fff8e1', text: '#f57f17' },
            'Contract Signed': { bg: '#e8f5e9', text: '#2e7d32' },
        };
        return map[status] ?? { bg: '#fff8e1', text: '#f57f17' };
    }

    // ─── Sub-components ───────────────────────────────────────────────────────────
    function StatusBadge({ value }: { value: string }) {
        if (!value) return null;
        const { bg, text, dot } = getStatusColors(value);
        return (
            <View style={[vStyles.statusBadge, { backgroundColor: bg }]}>
                <View style={[vStyles.statusDot, { backgroundColor: dot }]} />
                <Text style={[tStyles.statusBadgeText, { color: text }]}>{value}</Text>
            </View>
        );
    }

    function SectionHeader({
        label, color, icon, expanded, onToggle,
    }: {
        label: string; color: string; icon: string; expanded: boolean; onToggle: () => void;
    }) {
        return (
            <TouchableOpacity
                style={[vStyles.sectionHeader, { backgroundColor: color }]}
                onPress={onToggle}
                activeOpacity={0.85}
            >
                <Text style={tStyles.sectionIcon}>{icon}</Text>
                <Text style={tStyles.sectionTitle}>{label}</Text>
                <Text style={tStyles.sectionChevron}>{expanded ? '▲' : '▼'}</Text>
            </TouchableOpacity>
        );
    }

    function InspectionRow({
        label, value, remarks, isLast,
    }: {
        label: string; value: string; remarks: string; isLast: boolean;
    }) {
        return (
            <View style={[vStyles.row, !isLast && vStyles.rowBorder]}>
                <Text style={tStyles.rowLabel}>{label}</Text>
                <View style={vStyles.rowRight}>
                    <StatusBadge value={value} />
                    {!!remarks && <Text style={tStyles.rowRemarks}>{remarks}</Text>}
                </View>
            </View>
        );
    }

    function InspectionSection({
        section, data,
    }: {
        section: SectionConfig; data: ReportSection;
    }) {
        const [expanded, setExpanded] = useState(true);

        // ── FIX 1: typeof guard so .trim() is only called on strings ──
        const visibleItems = section.items.filter(item => {
            const val = data[item.key];
            return typeof val === 'string' && val.trim() !== '';
        });

        if (visibleItems.length === 0) return null;

        // ── FIX 2: double-cast through unknown to convert string | any[] → any[] ──
        const allSectionFiles: { label: string; fileName: string; url: string }[] =
            visibleItems.flatMap(item => {
                const raw = data[item.key + 'Files'];
                if (!raw) return [];
                const files = raw as unknown as any[];
                if (!Array.isArray(files)) return [];
                return files.map((f: any) => ({
                    label: item.label,
                    fileName: f.FileName as string,
                    url: BASE_URL + (f.FileName as string),
                }));
            });

        return (
            <View style={vStyles.sectionCard}>
                <SectionHeader
                    label={section.label}
                    color={Colors[theme ?? 'light'].danger}
                    icon={section.icon}
                    expanded={expanded}
                    onToggle={() => setExpanded(e => !e)}
                />
                {expanded && (
                    <View style={vStyles.sectionBody}>
                        {/* ── Inspection rows ── */}
                        {visibleItems.map((item, idx) => (
                            <InspectionRow
                                key={item.key}
                                label={item.label}
                                value={
                                    typeof data[item.key] === 'string'
                                        ? (data[item.key] as string)
                                        : ''
                                }
                                remarks={
                                    typeof data[item.key + 'Remarks'] === 'string'
                                        ? (data[item.key + 'Remarks'] as string)
                                        : ''
                                }
                                isLast={idx === visibleItems.length - 1}
                            />
                        ))}

                        {/* ── Section photos ── */}
                        {allSectionFiles.length > 0 && (
                            <View style={vStyles.photoBlock}>
                                <Text style={tStyles.photoHeading}>📷 Photos</Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={vStyles.photoScroll}
                                >
                                    {allSectionFiles.map((f, i) => (
                                        <View key={i} style={vStyles.photoItem}>
                                            <Image
                                                source={{ uri: f.url }}
                                                style={iStyles.sectionPhoto}
                                                resizeMode="cover"
                                            />
                                            <Text
                                                style={tStyles.photoLabel}
                                                numberOfLines={2}
                                            >
                                                {f.label}
                                            </Text>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </View>
                )}
            </View>
        );
    }

    function ScoreSummary({ report }: { report: TechReport }) {
        let total = 0, good = 0, avg = 0, bad = 0;
        SECTIONS.forEach(sec => {
            const data = report[sec.key] ?? {};
            sec.items.forEach(item => {
                const val = data[item.key];
                const v = (typeof val === 'string' ? val : '').toLowerCase();
                if (!v) return;
                total++;
                if (['bon', 'good', 'oui', 'yes', 'valide', 'valid'].includes(v)) good++;
                else if (['moyen', 'average'].includes(v)) avg++;
                else if (['mauvais', 'bad', 'non', 'no', 'expiré', 'expired'].includes(v)) bad++;
            });
        });
        const score = total ? Math.round((good / total) * 100) : 0;
        const barColor = score >= 80 ? '#43a047' : score >= 50 ? '#fbc02d' : '#e53935';

        return (
            <View style={vStyles.scoreCard}>
                <Text style={tStyles.scoreTitle}>Score Global</Text>
                <View style={vStyles.scoreRow}>
                    <View style={vStyles.scoreBig}>
                        <Text style={tStyles.scoreNumber}>{score}</Text>
                        <Text style={tStyles.scorePercent}>%</Text>
                    </View>
                    <View style={vStyles.scoreBreakdown}>
                        <View style={vStyles.scoreStat}>
                            <View style={[vStyles.scoreDot, { backgroundColor: '#43a047' }]} />
                            <Text style={tStyles.scoreStatText}>Bon: {good}</Text>
                        </View>
                        <View style={vStyles.scoreStat}>
                            <View style={[vStyles.scoreDot, { backgroundColor: '#fbc02d' }]} />
                            <Text style={tStyles.scoreStatText}>Moyen: {avg}</Text>
                        </View>
                        <View style={vStyles.scoreStat}>
                            <View style={[vStyles.scoreDot, { backgroundColor: '#e53935' }]} />
                            <Text style={tStyles.scoreStatText}>Mauvais: {bad}</Text>
                        </View>
                        <Text style={tStyles.scoreTotal}>{total} points inspectés</Text>
                    </View>
                </View>
                <View style={vStyles.barTrack}>
                    <View style={[vStyles.barFill, { width: `${score}%` as any, backgroundColor: barColor }]} />
                </View>
            </View>
        );
    }

    // ─── Styles ───────────────────────────────────────────────────────────────────

    const vStyles = StyleSheet.create<Record<string, ViewStyle>>({
        safe: { flex: 1, backgroundColor: Colors[theme ?? 'light'].background },
        headerBar: {
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: Colors[theme ?? 'light'].danger,
            paddingHorizontal: 16, paddingVertical: 12,
            elevation: 4,
            shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
        },
        headerBack: {
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: 'rgba(255,255,255,0.15)',
            alignItems: 'center', justifyContent: 'center',
        },
        headerCenter: { flex: 1, alignItems: 'center' },
        pdfBtn: {
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
        },
        scroll: { flex: 1 },
        scrollContent: { paddingBottom: 16 },
        imageBlock: {
            width: '100%', height: 240,
            backgroundColor: '#e0e0e0', overflow: 'hidden', position: 'relative',
        },
        watermarkWrap: {
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            alignItems: 'center', justifyContent: 'center',
        },
        thumbList: { paddingHorizontal: 12, paddingVertical: 10 },
        infoCard: {
            marginHorizontal: 12, marginTop: 4,
            backgroundColor: Colors[theme ?? 'light'].card, borderRadius: 16, padding: 16,
            elevation: 2,
            shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
        },
        infoTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
        reportBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
        divider: { height: 1, backgroundColor: Colors[theme ?? 'light'].light, marginVertical: 12 },
        priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
        officerBox: { alignItems: 'flex-end' },
        scoreCard: {
            marginHorizontal: 12, marginTop: 12,
            backgroundColor: Colors[theme ?? 'light'].card, borderRadius: 16, padding: 16,
            elevation: 2,
            shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
        },
        scoreRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
        scoreBig: { flexDirection: 'row', alignItems: 'flex-end', marginRight: 20 },
        scoreBreakdown: { flex: 1 },
        scoreStat: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
        scoreDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
        barTrack: { height: 6, backgroundColor: Colors[theme ?? 'light'].light, borderRadius: 3, overflow: 'hidden' },
        barFill: { height: '100%', borderRadius: 3 },
        reportHeading: { marginHorizontal: 12, marginTop: 20, marginBottom: 4, alignItems: 'center' },
        sectionCard: {
            marginHorizontal: 12, marginTop: 12,
            borderRadius: 14, overflow: 'hidden',
            elevation: 2,
            shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            backgroundColor: Colors[theme ?? 'light'].card,
        },
        sectionHeader: {
            flexDirection: 'row', alignItems: 'center',
            paddingHorizontal: 14, paddingVertical: 12,
        },
        sectionBody: { backgroundColor: Colors[theme ?? 'light'].card },
        row: {
            flexDirection: 'row', alignItems: 'flex-start',
            paddingHorizontal: 14, paddingVertical: 10,
        },
        rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors[theme ?? 'light'].light },
        rowRight: { alignItems: 'flex-end', minWidth: 90 },
        statusBadge: {
            flexDirection: 'row', alignItems: 'center',
            paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
        },
        statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
        // ── Photo block added ──
        photoBlock: {
            borderTopWidth: 1,
            borderTopColor: Colors[theme ?? 'light'].light,
            paddingTop: 12,
            paddingBottom: 12,
        },
        photoScroll: {
            paddingHorizontal: 14,
            gap: 10,
        },
        photoItem: {
            alignItems: 'center',
            width: 90,
        },
        signatureBlock: { flexDirection: 'row', marginHorizontal: 12, marginTop: 24 },
        signatureBox: { flex: 1, alignItems: 'center', marginHorizontal: 8 },
        signatureLine: {
            width: '100%', height: 60,
            borderBottomWidth: 2, borderBottomColor: Colors[theme ?? 'light'].danger,
            borderStyle: 'dashed', marginBottom: 8,
        },
        bottomActions: { flexDirection: 'row', marginHorizontal: 12, marginTop: 20 },
        btnOutline: {
            flex: 1, borderWidth: 2, borderColor: Colors[theme ?? 'light'].danger,
            borderRadius: 12, paddingVertical: 13,
            alignItems: 'center', justifyContent: 'center', marginRight: 10,
        },
        btnPrimary: {
            flex: 2, backgroundColor: Colors[theme ?? 'light'].danger,
            borderRadius: 12, paddingVertical: 13,
            alignItems: 'center', justifyContent: 'center',
            elevation: 3,
            shadowColor: Colors[theme ?? 'light'].danger, shadowOpacity: 0.3, shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
        },
        spacer: { height: 50 },
        signatureImage: { width: 120, height: 60, resizeMode: 'contain' },
    });

    const tStyles = StyleSheet.create<Record<string, TextStyle>>({
        headerBackIcon: { color: '#fff', fontSize: 18, fontWeight: '700' },
        headerTitle: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
        headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '500' },
        pdfBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
        watermark: {
            fontSize: 32, fontWeight: '900', color: '#fff', opacity: 0.12,
            letterSpacing: 4,
            transform: [{ rotate: '-25deg' }],
        },
        reportBadgeText: { fontSize: 12, fontWeight: '700' },
        vehicleType: { fontSize: 13, color: Colors[theme ?? 'light'].light, fontWeight: '500', marginLeft: 8 },
        carTitle: { fontSize: 20, fontWeight: '800', color: Colors[theme ?? 'light'].text, marginBottom: 4 },
        carRef: { fontSize: 13, color: Colors[theme ?? 'light'].light, fontWeight: '500' },
        priceLabel: { fontSize: 12, color: Colors[theme ?? 'light'].light, marginBottom: 2 },
        priceValue: { fontSize: 22, fontWeight: '900', color: Colors[theme ?? 'light'].danger },
        officerLabel: { fontSize: 11, color: Colors[theme ?? 'light'].light, marginBottom: 2 },
        officerName: { fontSize: 13, fontWeight: '700', color: Colors[theme ?? 'light'].text },
        officerDate: { fontSize: 11, color: Colors[theme ?? 'light'].text },
        scoreTitle: {
            fontSize: 13, fontWeight: '700', color: Colors[theme ?? 'light'].text,
            textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
        },
        scoreNumber: { fontSize: 52, fontWeight: '900', color: Colors[theme ?? 'light'].danger, lineHeight: 56 },
        scorePercent: { fontSize: 22, fontWeight: '700', color: Colors[theme ?? 'light'].danger, marginBottom: 6 },
        scoreStatText: { fontSize: 13, color: Colors[theme ?? 'light'].text, fontWeight: '600' },
        scoreTotal: { fontSize: 11, color: Colors[theme ?? 'light'].light, marginTop: 4 },
        reportHeadingTitle: { fontSize: 16, fontWeight: '800', color: Colors[theme ?? 'light'].text, textAlign: 'center' },
        reportHeadingSub: { fontSize: 12, color: Colors[theme ?? 'light'].light, textAlign: 'center', marginTop: 2 },
        sectionIcon: { fontSize: 16, marginRight: 8 },
        sectionTitle: { flex: 1, color: Colors[theme ?? 'light'].white, fontSize: 14, fontWeight: '800', letterSpacing: 0.2 },
        sectionChevron: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
        rowLabel: { flex: 1, fontSize: 13, color: Colors[theme ?? 'light'].text, fontWeight: '500', paddingTop: 2 },
        rowRemarks: {
            fontSize: 10, color: Colors[theme ?? 'light'].light, fontStyle: 'italic',
            textAlign: 'right', maxWidth: 130,
        },
        statusBadgeText: { fontSize: 11, fontWeight: '700' },
        // ── Photo styles added ──
        photoHeading: {
            fontSize: 11, fontWeight: '700',
            color: Colors[theme ?? 'light'].light,
            textTransform: 'uppercase', letterSpacing: 1,
            paddingHorizontal: 14, marginBottom: 8,
        },
        photoLabel: {
            fontSize: 10, color: Colors[theme ?? 'light'].light,
            textAlign: 'center', marginTop: 4,
            maxWidth: 90,
        },
        signatureLabel: { fontSize: 11, color: Colors[theme ?? 'light'].light, textAlign: 'center', fontWeight: '600' },
        btnOutlineText: { color: Colors[theme ?? 'light'].danger, fontSize: 14, fontWeight: '700' },
        btnPrimaryText: { color: '#fff', fontSize: 14, fontWeight: '700' },
    });

    const iStyles = StyleSheet.create<Record<string, ImageStyle>>({
        mainImage: { width: '100%', height: '100%' },
        thumb: {
            width: 68, height: 52, borderRadius: 8, marginRight: 8,
            borderWidth: 2, borderColor: 'transparent',
        },
        thumbActive: { borderColor: Colors[theme ?? 'light'].danger },
        // ── Section photo thumbnail ──
        sectionPhoto: {
            width: 90, height: 68,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: Colors[theme ?? 'light'].light,
        },
    });

    const goBack = () => {
        console.log(router.canGoBack());
        if (router.canGoBack())
            router.back();
    };

    if (loading) {
        return (
            <View style={[styles.background, styles.flexOne, styles.justifyCenter, styles.itemCenter]}>
                <View className="flex flex-row items-center justify-center">
                    <ActivityIndicator size="small" color={Colors[theme ?? 'light'].text} />
                    <Text className="ml-5" style={{ color: Colors[theme ?? 'light'].text }}>
                        Chargement...
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.background, vStyles.scroll]}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ marginTop: insets.top, marginBottom: insets.bottom }}
        >
            {/* ── Header ── */}
            <View className="flex flex-row items-start gap-5 px-5 pt-5">
                <View>
                    <TouchableOpacity
                        style={[styles.btnIcon, styles.roundedCircle, styles.primary]}
                        onPress={() => { goBack(); }}
                    >
                        <Ionicons name="chevron-back" size={30} color={Colors[theme ?? 'light'].white} />
                    </TouchableOpacity>
                </View>
                <View className="flex-1">
                    <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xl }]}>
                        Rapport de contrôle technique du véhicule
                    </ThemedText>
                    <ThemedText style={[styles.colorLight, { fontSize: FONT_SIZES.sm, flexShrink: 0 }]}>
                        Évaluation officielle vérifiée AlloMotors
                    </ThemedText>
                </View>
            </View>

            {/* ── Vehicle Info Card ── */}
            <View style={[vStyles.infoCard, { marginTop: 20 }]}>
                <View style={vStyles.infoTopRow}>
                    <View style={[vStyles.reportBadge, { backgroundColor: reportBadge.bg }]}>
                        <Text style={[tStyles.reportBadgeText, { color: reportBadge.text }]}>
                            ✓ {parsedData?.ReportStatus}
                        </Text>
                    </View>
                </View>

                <Text style={tStyles.carTitle}>{parsedData?.Title}</Text>
                <Text style={tStyles.carRef}>Réf: {parsedData?.Reference}</Text>

                <View style={vStyles.divider} />

                <View style={vStyles.priceRow}>
                    <View>
                        <Text style={tStyles.priceLabel}>Prix</Text>
                        {parsedData?.Attributes?.HidePrice ? (
                            <ThemedText style={[styles.colorDanger, styles.fontBold, { fontSize: 18, lineHeight: 18 }]}>
                                ****
                            </ThemedText>
                        ) : (
                            <ThemedText style={[styles.colorDanger, styles.fontBold, { fontSize: 18, lineHeight: 18 }]}>
                                {formatNODecimal(parsedData?.SellingPrice) || 0}€
                            </ThemedText>
                        )}
                    </View>
                    <View style={vStyles.officerBox} />
                </View>
            </View>

{/* <View className="flex flex-row items-center justify-between gap-3 mt-4 mx-4">
                                <>
                                    <View className="flex-1">
                                        <TouchableOpacity onPress={() => { }}
                                            className="flex flex-row items-center justify-center gap-2 rounded-md py-4 px-4" style={[styles.success, styles.btnShadow]}>
                                            <Ionicons name="send" size={24} color={Colors[theme ?? 'light'].white} />
                                            <ThemedText lightColor={Colors[theme ?? 'light'].white} style={[styles.fontBold]}>Send Technical Report</ThemedText>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            </View> */}

            {/* ── Inspection Sections ── */}
            {SECTIONS.map(section => (
                <InspectionSection
                    key={section.key}
                    section={section}
                    data={parsedData?.TechReport?.[section.key] ?? advert?.techReport?.[section.key]}
                />
            ))}

            {/* ── Signature Block ── */}
            <View className='mb-10' style={vStyles.signatureBlock}>
                <View style={vStyles.signatureBox}>
                     
                    <Image
                        source={{ uri: parsedData?.TechReport?.EmpSignURL || '' }}
                        resizeMode="contain"
                        width={300}
                        height={100}
                    />
                    <View style={vStyles.signatureLine} />
                    <Text style={tStyles.signatureLabel}>
                        Agent {parsedData?.TechReport?.EmpName || ''} de contrôle technique{'\n'}Signature
                    </Text>
                </View>
            </View>

            <View style={vStyles.spacer} />
        </ScrollView>
    );
}


















// // ─── Types ────────────────────────────────────────────────────────────────────
// interface ReportSection {
//     [key: string]: string;
// }

// interface TechReport {
//     Engine: ReportSection;
//     Tires: ReportSection;
//     Lighting: ReportSection;
//     Glass: ReportSection;
//     Interior: ReportSection;
//     Body: ReportSection;
//     Maintenance: ReportSection;
// }

// interface Advert {
//     title: string;
//     reference: string;
//     vehicleType: string;
//     sellingPrice: number;
//     hidePrice: boolean;
//     reportStatus: string;
//     imageUrl: string;
//     thumbnails: string[];
//     inspectionOfficer: string;
//     inspectionDate: string;
//     techReport: TechReport;
// }

// interface SectionConfig {
//     key: keyof TechReport;
//     label: string;
//     color: string;
//     icon: string;
//     items: { label: string; key: string }[];
// }

// // ─── Mock Data ────────────────────────────────────────────────────────────────
// const MOCK_ADVERT: Advert = {
//     title: 'Toyota Corolla 2021',
//     reference: 'AM-2024-00129',
//     vehicleType: '🚗 Sedan',
//     sellingPrice: 18500,
//     hidePrice: false,
//     reportStatus: 'Verified',
//     imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&q=80',
//     thumbnails: [
//         'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=200&q=60',
//         'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=200&q=60',
//         'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=200&q=60',
//     ],
//     inspectionOfficer: 'Youssef Amine',
//     inspectionDate: '12 April 2025',
//     techReport: {
//         Engine: {
//             EngineSealing: 'Bon', EngineSealingRemarks: '',
//             EngineOil: 'Bon', EngineOilRemarks: 'Niveau correct',
//             CoolantFluid: 'Bon', CoolantFluidRemarks: '',
//             BrakeFluid: 'Moyen', BrakeFluidRemarks: 'À surveiller',
//             PowerSteering: 'Bon', PowerSteeringRemarks: '',
//             HosesCondition: 'Bon', HosesConditionRemarks: '',
//             WiringHarness: 'Bon', WiringHarnessRemarks: '',
//             BatteryCondition: 'Bon', BatteryConditionRemarks: '12V OK',
//             EngineNoise: 'Bon', EngineNoiseRemarks: '',
//         },
//         Tires: {
//             FrontRightTire: 'Bon', FrontRightTireRemarks: '',
//             FrontLeftTire: 'Bon', FrontLeftTireRemarks: '',
//             RearRightTire: 'Moyen', RearRightTireRemarks: 'Usure légère',
//             RearLeftTire: 'Bon', RearLeftTireRemarks: '',
//             SameBrandPerAxle: 'Oui', SameBrandPerAxleRemarks: '',
//             ConditionOfRims: 'Bon', ConditionOfRimsRemarks: '',
//         },
//         Lighting: {
//             FrontLights: 'Bon', FrontLightsRemarks: '',
//             FrontIndicators: 'Bon', FrontIndicatorsRemarks: '',
//             RearLights: 'Bon', RearLightsRemarks: '',
//             RearIndicators: 'Bon', RearIndicatorsRemarks: '',
//             StopLight: 'Bon', StopLightRemarks: '',
//             FogLight: 'Mauvais', FogLightRemarks: 'Ampoule grillée',
//         },
//         Glass: {
//             Windshield: 'Bon', WindshieldRemarks: '',
//             RearWindow: 'Bon', RearWindowRemarks: '',
//             RightSideWindow: 'Bon', RightSideWindowRemarks: '',
//             LeftSideWindow: 'Bon', LeftSideWindowRemarks: '',
//             InnerMirror: 'Bon', InnerMirrorRemarks: '',
//             OuterMirror: 'Bon', OuterMirrorRemarks: '',
//             WiperCondition: 'Moyen', WiperConditionRemarks: 'À remplacer',
//             WiperFunctional: 'Oui', WiperFunctionalRemarks: '',
//             WasherJet: 'Oui', WasherJetRemarks: '',
//         },
//         Interior: {
//             SeatCondition: 'Bon', SeatConditionRemarks: '',
//             SeatbeltCondition: 'Bon', SeatbeltConditionRemarks: '',
//             SteeringWheel: 'Bon', SteeringWheelRemarks: '',
//             DashboardCondition: 'Bon', DashboardConditionRemarks: '',
//             DashboardIndicators: 'Bon', DashboardIndicatorsRemarks: 'Aucun voyant',
//             AirConditioning: 'Bon', AirConditioningRemarks: '',
//             Blower: 'Bon', BlowerRemarks: '',
//             Display: 'Bon', DisplayRemarks: '',
//             RadarCamera: 'Bon', RadarCameraRemarks: '',
//             Horn: 'Bon', HornRemarks: '',
//             CentralLocking: 'Bon', CentralLockingRemarks: '',
//         },
//         Body: {
//             GeneralCondition: 'Bon', GeneralConditionRemarks: '',
//             FrontBumper: 'Bon', FrontBumperRemarks: '',
//             Hood: 'Bon', HoodRemarks: '',
//             Grille: 'Bon', GrilleRemarks: '',
//             Roof: 'Bon', RoofRemarks: '',
//             FrontRightWing: 'Moyen', FrontRightWingRemarks: 'Légère rayure',
//             RightDoors: 'Bon', RightDoorsRemarks: '',
//             RightSill: 'Bon', RightSillRemarks: '',
//             RearRightWing: 'Bon', RearRightWingRemarks: '',
//             RearBumper: 'Bon', RearBumperRemarks: '',
//             BootTailgate: 'Bon', BootTailgateRemarks: '',
//             RearLeftWing: 'Bon', RearLeftWingRemarks: '',
//             LeftSill: 'Bon', LeftSillRemarks: '',
//             LeftDoors: 'Bon', LeftDoorsRemarks: '',
//             FrontLeftWing: 'Bon', FrontLeftWingRemarks: '',
//         },
//         Maintenance: {
//             UpToDate: 'Oui', UpToDateRemarks: '',
//             TimingBelt: 'Bon', TimingBeltRemarks: 'Changée à 80 000 km',
//             GearboxOilChange: 'Oui', GearboxOilChangeRemarks: '',
//             SpareKey: 'Oui', SpareKeyRemarks: '',
//             RoadworthinessTest: 'Valide', RoadworthinessTestRemarks: "Valide jusqu'à 12/2025",
//         },
//     },
// };

// // ─── Section Configs ──────────────────────────────────────────────────────────
// const SECTIONS: SectionConfig[] = [
//     {
//         key: 'Engine', label: 'Compartiment Moteur', color: '#e53935', icon: '🔧',
//         items: [
//             { label: 'Étanchéité moteur', key: 'EngineSealing' },
//             { label: 'Huile moteur', key: 'EngineOil' },
//             { label: 'Liquide refroidissement', key: 'CoolantFluid' },
//             { label: 'Liquide de frein', key: 'BrakeFluid' },
//             { label: 'Direction assistée', key: 'PowerSteering' },
//             { label: 'État des durites', key: 'HosesCondition' },
//             { label: 'État des faisceaux', key: 'WiringHarness' },
//             { label: 'État batterie', key: 'BatteryCondition' },
//             { label: 'Bruit moteur', key: 'EngineNoise' },
//         ],
//     },
//     {
//         key: 'Tires', label: 'Pneus', color: '#212121', icon: '⚙️',
//         items: [
//             { label: 'Pneu Avant Droit', key: 'FrontRightTire' },
//             { label: 'Pneu Avant Gauche', key: 'FrontLeftTire' },
//             { label: 'Pneu Arrière Droit', key: 'RearRightTire' },
//             { label: 'Pneu Arrière Gauche', key: 'RearLeftTire' },
//             { label: 'Même marque / essieu', key: 'SameBrandPerAxle' },
//             { label: 'État des jantes', key: 'ConditionOfRims' },
//         ],
//     },
//     {
//         key: 'Lighting', label: 'Éclairage', color: '#f9a825', icon: '💡',
//         items: [
//             { label: 'Feux Avant', key: 'FrontLights' },
//             { label: 'Clignotants Avant', key: 'FrontIndicators' },
//             { label: 'Feux Arrière', key: 'RearLights' },
//             { label: 'Clignotants Arrière', key: 'RearIndicators' },
//             { label: 'Feu Stop', key: 'StopLight' },
//             { label: 'Antibrouillard', key: 'FogLight' },
//         ],
//     },
//     {
//         key: 'Glass', label: 'Vitrage', color: '#0288d1', icon: '🪟',
//         items: [
//             { label: 'Pare-brise', key: 'Windshield' },
//             { label: 'Lunette arrière', key: 'RearWindow' },
//             { label: 'Vitre droite', key: 'RightSideWindow' },
//             { label: 'Vitre gauche', key: 'LeftSideWindow' },
//             { label: 'Rétro intérieur', key: 'InnerMirror' },
//             { label: 'Rétro extérieur', key: 'OuterMirror' },
//             { label: 'État essuie-glace', key: 'WiperCondition' },
//             { label: 'Essuie-glace fonctionnel', key: 'WiperFunctional' },
//             { label: 'Gicleur', key: 'WasherJet' },
//         ],
//     },
//     {
//         key: 'Interior', label: 'Habitacle', color: '#2e7d32', icon: '🪑',
//         items: [
//             { label: 'État des sièges', key: 'SeatCondition' },
//             { label: 'Ceintures', key: 'SeatbeltCondition' },
//             { label: 'Volant', key: 'SteeringWheel' },
//             { label: 'Tableau de bord', key: 'DashboardCondition' },
//             { label: 'Voyants', key: 'DashboardIndicators' },
//             { label: 'Climatisation', key: 'AirConditioning' },
//             { label: 'Soufflerie', key: 'Blower' },
//             { label: 'Écran', key: 'Display' },
//             { label: 'Radar / Caméra', key: 'RadarCamera' },
//             { label: 'Klaxon', key: 'Horn' },
//             { label: 'Verrouillage centralisé', key: 'CentralLocking' },
//         ],
//     },
//     {
//         key: 'Body', label: 'Carrosserie', color: '#546e7a', icon: '🚘',
//         items: [
//             { label: 'État général', key: 'GeneralCondition' },
//             { label: 'Pare-choc avant', key: 'FrontBumper' },
//             { label: 'Capot', key: 'Hood' },
//             { label: 'Calandre', key: 'Grille' },
//             { label: 'Pavillon', key: 'Roof' },
//             { label: 'Aile Avant Droite', key: 'FrontRightWing' },
//             { label: 'Portes droites', key: 'RightDoors' },
//             { label: 'Bas de caisse droit', key: 'RightSill' },
//             { label: 'Aile Arrière Droite', key: 'RearRightWing' },
//             { label: 'Pare-choc arrière', key: 'RearBumper' },
//             { label: 'Hayon / Coffre', key: 'BootTailgate' },
//             { label: 'Aile Arrière Gauche', key: 'RearLeftWing' },
//             { label: 'Bas de caisse gauche', key: 'LeftSill' },
//             { label: 'Portes gauches', key: 'LeftDoors' },
//             { label: 'Aile Avant Gauche', key: 'FrontLeftWing' },
//         ],
//     },
//     {
//         key: 'Maintenance', label: 'Informations Véhicule', color: '#6a1b9a', icon: '📋',
//         items: [
//             { label: 'Révision à jour', key: 'UpToDate' },
//             { label: 'Distribution', key: 'TimingBelt' },
//             { label: 'Vidange boîte', key: 'GearboxOilChange' },
//             { label: 'Double de clé', key: 'SpareKey' },
//             { label: 'Contrôle technique', key: 'RoadworthinessTest' },
//         ],
//     },
// ];



// // ─── Main Screen ──────────────────────────────────────────────────────────────
// interface Props {
//     navigation?: { goBack: () => void };
//     advert?: Advert;
// }

// export default function TechnicalReportScreen({ navigation, advert = MOCK_ADVERT }: Props) {
//     const [selectedThumb, setSelectedThumb] = useState<string>(advert.imageUrl);
//     const reportBadge = getReportBadgeColors(advert.reportStatus);
//     const theme = useColorScheme();
//     const { styles, FONT_SIZES } = useGlobalStyles();
//     const insets = useSafeAreaInsets();
//     const router = useRouter();
//     const [loading, setLoading] = useState(false);
//     const params = useSearchParams();
//     const id = params.get("id");
//     const page = params.get("page");
//     const item = params.get("item") ? JSON.parse(params.get("item") as string)?.ItemGuid : null;
//     const [parsedData, setparsedData] = useState<any>();
// const BASE_URL = 'https://dev.allomotors.fr/Content/Webdata/UF/';
//     const GetAdvert = async (id: any) => {
//         const baseURL = 'https://allomotors.fr/Content/WebData/UF/';
//         let data = item ? JSON.parse(params.get("item") as string) : null;
//         data.TechReport = data.TechReport ? JSON.parse(data.TechReport) : null;
//         if (data?.TechReport?.EmpSignURL)
//             data.TechReport.EmpSignURL = `${baseURL}${data?.TechReport.EmpSignURL}`

        

//         setparsedData(data);
//         console.log('parsedData :', parsedData);


//         // if (!id) return;
//         // setLoading(true);
//         // try {
//         //     const response = await apiCall('POST', `/Account/LoadAdvertDetails/${id}`, null, null);
//         //     const data = response.data.obj; 

//         //     data.TechReport = data.TechReport ? JSON.parse(data.TechReport) : null;
//         //     if (data?.TechReport?.EmpSignURL)
//         //         data.TechReport.EmpSignURL = `${baseURL}${data?.TechReport.EmpSignURL}`
//         //     setparsedData(data);
//         // } catch (error) {
//         //     console.error("Failed to fetch advert:", error);
//         // } finally {
//         //     setLoading(false);
//         // }
//     };

//     useEffect(() => {
//         console.log('itemGuid :', id);
//         GetAdvert(id);
//         // if (page == "public_catalogs")
//         //     fetchAds("App Advert Detail Particulier");
//         // else
//         //     fetchAds("App Advert Detail Pro");
//     }, [id]);



//     // ─── Helpers ──────────────────────────────────────────────────────────────────
//     interface StatusColors { bg: string; text: string; dot: string }

//     function getStatusColors(value: string): StatusColors {
//         const v = (value || '').toLowerCase();
//         if (['bon', 'good', 'oui', 'yes', 'valide', 'valid'].includes(v))
//             return { bg: '#e8f5e9', text: '#1b5e20', dot: '#43a047' };
//         if (['moyen', 'average'].includes(v))
//             return { bg: '#fff8e1', text: '#f57f17', dot: '#fbc02d' };
//         if (['mauvais', 'bad', 'non', 'no', 'expiré', 'expired'].includes(v))
//             return { bg: '#ffebee', text: '#b71c1c', dot: '#e53935' };
//         return { bg: '#f5f5f5', text: '#616161', dot: '#9e9e9e' };
//     }

//     function getReportBadgeColors(status: string): { bg: string; text: string } {
//         const map: Record<string, { bg: string; text: string }> = {
//             Verified: { bg: '#e8f5e9', text: '#2e7d32' },
//             'Inspection Completed': { bg: '#e3f2fd', text: '#1565c0' },
//             'Report Generated': { bg: '#ede7f6', text: '#4527a0' },
//             'Contract Sent': { bg: '#e3f2fd', text: '#1565c0' },
//             'Waiting for Signature': { bg: '#fff8e1', text: '#f57f17' },
//             'Contract Signed': { bg: '#e8f5e9', text: '#2e7d32' },
//         };
//         return map[status] ?? { bg: '#fff8e1', text: '#f57f17' };
//     }


//     // ─── Sub-components ───────────────────────────────────────────────────────────
//     function StatusBadge({ value }: { value: string }) {
//         if (!value) return null;
//         const { bg, text, dot } = getStatusColors(value);
//         return (
//             <View style={[vStyles.statusBadge, { backgroundColor: bg }]}>
//                 <View style={[vStyles.statusDot, { backgroundColor: dot }]} />
//                 <Text style={[tStyles.statusBadgeText, { color: text }]}>{value}</Text>
//             </View>
//         );
//     }

//     function SectionHeader({
//         label, color, icon, expanded, onToggle,
//     }: {
//         label: string; color: string; icon: string; expanded: boolean; onToggle: () => void;
//     }) {
//         return (
//             <TouchableOpacity
//                 style={[vStyles.sectionHeader, { backgroundColor: color }]}
//                 onPress={onToggle}
//                 activeOpacity={0.85}
//             >
//                 <Text style={tStyles.sectionIcon}>{icon}</Text>
//                 <Text style={tStyles.sectionTitle}>{label}</Text>
//                 <Text style={tStyles.sectionChevron}>{expanded ? '▲' : '▼'}</Text>
//             </TouchableOpacity>
//         );
//     }

//     function InspectionRow({
//         label, value, remarks, isLast,
//     }: {
//         label: string; value: string; remarks: string; isLast: boolean;
//     }) {
//         return (
//             <>
//             <View style={[vStyles.row, !isLast && vStyles.rowBorder]}>
//                 <Text style={tStyles.rowLabel}>{label}</Text>
//                 <View style={vStyles.rowRight}>
//                     <StatusBadge value={value} />
//                     {!!remarks && <Text style={tStyles.rowRemarks}>{remarks}</Text>}
//                 </View>
//             </View>


//             </>

//         );
//     }

//     function InspectionSection({
//         section, data,
//     }: {
//         section: SectionConfig; data: ReportSection;
//     }) {
//         const [expanded, setExpanded] = useState(true);

//         const visibleItems = section.items.filter(
//             item => data[item.key] && data[item.key].trim() !== '',
//         );
//         if (visibleItems.length === 0) return null;

//         return (
//             <View style={vStyles.sectionCard}>
//                 <SectionHeader
//                     label={section.label}
//                     color={Colors[theme ?? 'light'].danger}
//                     icon={section.icon}
//                     expanded={expanded}
//                     onToggle={() => setExpanded(e => !e)}
//                 />
//                 {expanded && (
//                     <View style={vStyles.sectionBody}>
//                         {visibleItems.map((item, idx) => (
//                             <InspectionRow
//                                 key={item.key}
//                                 label={item.label}
//                                 value={data[item.key] ?? ''}
//                                 remarks={data[item.key + 'Remarks'] ?? ''}
//                                 isLast={idx === visibleItems.length - 1}
//                             />
//                         ))}

//                         <View>
//                             {/* PHOTOS */}
//                   {visibleItems.map((item, idx) => (
//                     <ScrollView horizontal>
//                       {[item.key + 'Files']?.map((f : any, i) => (
//                         <>
//                         <View>
//                             <Text>f.FileName : {f.FileName}</Text>
//                         {/* <Image
//                           key={i}
//                           source={{ uri: BASE_URL + f.FileName }} // Replace with your image URL
//                         style={[iStyles.thumb, iStyles.thumbActive]}
//                         /> */}
//                         </View>
//                         </>

//                       ))}
//                     </ScrollView>
//                   ))}
//                         </View>
//                     </View>
//                 )}
//             </View>
//         );
//     }

//     function ScoreSummary({ report }: { report: TechReport }) {
//         let total = 0, good = 0, avg = 0, bad = 0;
//         SECTIONS.forEach(sec => {
//             const data = report[sec.key] ?? {};
//             sec.items.forEach(item => {
//                 const v = (data[item.key] ?? '').toLowerCase();
//                 if (!v) return;
//                 total++;
//                 if (['bon', 'good', 'oui', 'yes', 'valide', 'valid'].includes(v)) good++;
//                 else if (['moyen', 'average'].includes(v)) avg++;
//                 else if (['mauvais', 'bad', 'non', 'no', 'expiré', 'expired'].includes(v)) bad++;
//             });
//         });
//         const score = total ? Math.round((good / total) * 100) : 0;
//         const barColor = score >= 80 ? '#43a047' : score >= 50 ? '#fbc02d' : '#e53935';

//         return (
//             <View style={vStyles.scoreCard}>
//                 <Text style={tStyles.scoreTitle}>Score Global</Text>
//                 <View style={vStyles.scoreRow}>
//                     <View style={vStyles.scoreBig}>
//                         <Text style={tStyles.scoreNumber}>{score}</Text>
//                         <Text style={tStyles.scorePercent}>%</Text>
//                     </View>
//                     <View style={vStyles.scoreBreakdown}>
//                         <View style={vStyles.scoreStat}>
//                             <View style={[vStyles.scoreDot, { backgroundColor: '#43a047' }]} />
//                             <Text style={tStyles.scoreStatText}>Bon: {good}</Text>
//                         </View>
//                         <View style={vStyles.scoreStat}>
//                             <View style={[vStyles.scoreDot, { backgroundColor: '#fbc02d' }]} />
//                             <Text style={tStyles.scoreStatText}>Moyen: {avg}</Text>
//                         </View>
//                         <View style={vStyles.scoreStat}>
//                             <View style={[vStyles.scoreDot, { backgroundColor: '#e53935' }]} />
//                             <Text style={tStyles.scoreStatText}>Mauvais: {bad}</Text>
//                         </View>
//                         <Text style={tStyles.scoreTotal}>{total} points inspectés</Text>
//                     </View>
//                 </View>
//                 <View style={vStyles.barTrack}>
//                     <View style={[vStyles.barFill, { width: `${score}%` as any, backgroundColor: barColor }]} />
//                 </View>
//             </View>
//         );
//     }

//     // ─── Styles — split by component type to satisfy TypeScript ──────────────────

//     // View-only styles
//     const vStyles = StyleSheet.create<Record<string, ViewStyle>>({
//         safe: { flex: 1, backgroundColor: Colors[theme ?? 'light'].background },
//         headerBar: {
//             flexDirection: 'row', alignItems: 'center',
//             backgroundColor: Colors[theme ?? 'light'].danger,
//             paddingHorizontal: 16, paddingVertical: 12,
//             elevation: 4,
//             shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4,
//             shadowOffset: { width: 0, height: 2 },
//         },
//         headerBack: {
//             width: 36, height: 36, borderRadius: 18,
//             backgroundColor: 'rgba(255,255,255,0.15)',
//             alignItems: 'center', justifyContent: 'center',
//         },
//         headerCenter: { flex: 1, alignItems: 'center' },
//         pdfBtn: {
//             backgroundColor: 'rgba(255,255,255,0.2)',
//             borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
//         },
//         scroll: { flex: 1 },
//         scrollContent: { paddingBottom: 16 },
//         imageBlock: {
//             width: '100%', height: 240,
//             backgroundColor: '#e0e0e0', overflow: 'hidden', position: 'relative',
//         },
//         watermarkWrap: {
//             position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
//             alignItems: 'center', justifyContent: 'center',
//         },
//         thumbList: { paddingHorizontal: 12, paddingVertical: 10 },
//         infoCard: {
//             marginHorizontal: 12, marginTop: 4,
//             backgroundColor: Colors[theme ?? 'light'].card, borderRadius: 16, padding: 16,
//             elevation: 2,
//             shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6,
//             shadowOffset: { width: 0, height: 2 },
//         },
//         infoTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
//         reportBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
//         divider: { height: 1, backgroundColor: Colors[theme ?? 'light'].light, marginVertical: 12 },
//         priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
//         officerBox: { alignItems: 'flex-end' },
//         scoreCard: {
//             marginHorizontal: 12, marginTop: 12,
//             backgroundColor: Colors[theme ?? 'light'].card, borderRadius: 16, padding: 16,
//             elevation: 2,
//             shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6,
//             shadowOffset: { width: 0, height: 2 },
//         },
//         scoreRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
//         scoreBig: { flexDirection: 'row', alignItems: 'flex-end', marginRight: 20 },
//         scoreBreakdown: { flex: 1 },
//         scoreStat: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
//         scoreDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
//         barTrack: { height: 6, backgroundColor: Colors[theme ?? 'light'].light, borderRadius: 3, overflow: 'hidden' },
//         barFill: { height: '100%', borderRadius: 3 },
//         reportHeading: { marginHorizontal: 12, marginTop: 20, marginBottom: 4, alignItems: 'center' },
//         sectionCard: {
//             marginHorizontal: 12, marginTop: 12,
//             borderRadius: 14, overflow: 'hidden',
//             elevation: 2,
//             shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
//             shadowOffset: { width: 0, height: 2 },
//             backgroundColor: Colors[theme ?? 'light'].card,
//         },
//         sectionHeader: {
//             flexDirection: 'row', alignItems: 'center',
//             paddingHorizontal: 14, paddingVertical: 12,
//         },
//         sectionBody: { backgroundColor: Colors[theme ?? 'light'].card },
//         row: {
//             flexDirection: 'row', alignItems: 'flex-start',
//             paddingHorizontal: 14, paddingVertical: 10,
//         },
//         rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors[theme ?? 'light'].light },
//         rowRight: { alignItems: 'flex-end', minWidth: 90 },
//         statusBadge: {
//             flexDirection: 'row', alignItems: 'center',
//             paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
//         },
//         statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
//         signatureBlock: { flexDirection: 'row', marginHorizontal: 12, marginTop: 24 },
//         signatureBox: { flex: 1, alignItems: 'center', marginHorizontal: 8 },
//         signatureLine: {
//             width: '100%', height: 60,
//             borderBottomWidth: 2, borderBottomColor: Colors[theme ?? 'light'].danger,
//             borderStyle: 'dashed', marginBottom: 8,
//         },
//         bottomActions: { flexDirection: 'row', marginHorizontal: 12, marginTop: 20 },
//         btnOutline: {
//             flex: 1, borderWidth: 2, borderColor: Colors[theme ?? 'light'].danger,
//             borderRadius: 12, paddingVertical: 13,
//             alignItems: 'center', justifyContent: 'center', marginRight: 10,
//         },
//         btnPrimary: {
//             flex: 2, backgroundColor: Colors[theme ?? 'light'].danger,
//             borderRadius: 12, paddingVertical: 13,
//             alignItems: 'center', justifyContent: 'center',
//             elevation: 3,
//             shadowColor: Colors[theme ?? 'light'].danger, shadowOpacity: 0.3, shadowRadius: 6,
//             shadowOffset: { width: 0, height: 3 },
//         },
//         spacer: { height: 50 },
//         signatureImage: { width: 120, height: 60, resizeMode: 'contain' },
//     });

//     // Text-only styles
//     const tStyles = StyleSheet.create<Record<string, TextStyle>>({
//         headerBackIcon: { color: '#fff', fontSize: 18, fontWeight: '700' },
//         headerTitle: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
//         headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '500' },
//         pdfBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
//         watermark: {
//             fontSize: 32, fontWeight: '900', color: '#fff', opacity: 0.12,
//             letterSpacing: 4,
//             transform: [{ rotate: '-25deg' }],
//         },
//         reportBadgeText: { fontSize: 12, fontWeight: '700' },
//         vehicleType: { fontSize: 13, color: Colors[theme ?? 'light'].light, fontWeight: '500', marginLeft: 8 },
//         carTitle: { fontSize: 20, fontWeight: '800', color: Colors[theme ?? 'light'].text, marginBottom: 4 },
//         carRef: { fontSize: 13, color: Colors[theme ?? 'light'].light, fontWeight: '500' },
//         priceLabel: { fontSize: 12, color: Colors[theme ?? 'light'].light, marginBottom: 2 },
//         priceValue: { fontSize: 22, fontWeight: '900', color: Colors[theme ?? 'light'].danger },
//         officerLabel: { fontSize: 11, color: Colors[theme ?? 'light'].light, marginBottom: 2 },
//         officerName: { fontSize: 13, fontWeight: '700', color: Colors[theme ?? 'light'].text },
//         officerDate: { fontSize: 11, color: Colors[theme ?? 'light'].text },
//         scoreTitle: {
//             fontSize: 13, fontWeight: '700', color: Colors[theme ?? 'light'].text,
//             textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
//         },
//         scoreNumber: { fontSize: 52, fontWeight: '900', color: Colors[theme ?? 'light'].danger, lineHeight: 56 },
//         scorePercent: { fontSize: 22, fontWeight: '700', color: Colors[theme ?? 'light'].danger, marginBottom: 6 },
//         scoreStatText: { fontSize: 13, color: Colors[theme ?? 'light'].text, fontWeight: '600' },
//         scoreTotal: { fontSize: 11, color: Colors[theme ?? 'light'].light, marginTop: 4 },
//         reportHeadingTitle: { fontSize: 16, fontWeight: '800', color: Colors[theme ?? 'light'].text, textAlign: 'center' },
//         reportHeadingSub: { fontSize: 12, color: Colors[theme ?? 'light'].light, textAlign: 'center', marginTop: 2 },
//         sectionIcon: { fontSize: 16, marginRight: 8 },
//         sectionTitle: { flex: 1, color: Colors[theme ?? 'light'].white, fontSize: 14, fontWeight: '800', letterSpacing: 0.2 },
//         sectionChevron: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
//         rowLabel: { flex: 1, fontSize: 13, color: Colors[theme ?? 'light'].text, fontWeight: '500', paddingTop: 2 },
//         rowRemarks: {
//             fontSize: 10, color: Colors[theme ?? 'light'].light, fontStyle: 'italic',
//             textAlign: 'right', maxWidth: 130,
//         },
//         statusBadgeText: { fontSize: 11, fontWeight: '700' },
//         signatureLabel: { fontSize: 11, color: Colors[theme ?? 'light'].light, textAlign: 'center', fontWeight: '600' },
//         btnOutlineText: { color: Colors[theme ?? 'light'].danger, fontSize: 14, fontWeight: '700' },
//         btnPrimaryText: { color: '#fff', fontSize: 14, fontWeight: '700' },
//     });

//     // Image-only styles
//     const iStyles = StyleSheet.create<Record<string, ImageStyle>>({
//         mainImage: { width: '100%', height: '100%' },
//         thumb: {
//             width: 68, height: 52, borderRadius: 8, marginRight: 8,
//             borderWidth: 2, borderColor: 'transparent',
//         },
//         thumbActive: { borderColor: Colors[theme ?? 'light'].danger },
//     });


//     const goBack = () => {
//         console.log(router.canGoBack());
//         if (router.canGoBack())
//             router.back();
//     };

//     if (loading) {
//         return (
//             <View style={[styles.background, styles.flexOne, styles.justifyCenter, styles.itemCenter]}>
//                 <View className="flex flex-row items-center justify-center">
//                     <ActivityIndicator size="small" color={Colors[theme ?? 'light'].text} />
//                     <Text className="ml-5" style={{ color: Colors[theme ?? 'light'].text }}>
//                         Chargement...
//                     </Text>
//                 </View>
//             </View>
//         );
//     }

//     return (
//         <ScrollView
//             style={[styles.background, vStyles.scroll]}
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={{ marginTop: insets.top, marginBottom: insets.bottom }}>
//             <View className="flex flex-row items-start gap-5 px-5 pt-5">
//                 <View>
//                     <TouchableOpacity style={[styles.btnIcon, styles.roundedCircle, styles.primary]}
//                         onPress={() => { goBack() }}>
//                         <Ionicons name="chevron-back" size={30} color={Colors[theme ?? 'light'].white} />
//                     </TouchableOpacity>
//                 </View>
//                 <View className="flex-1">
//                     <ThemedText style={[styles.fontBold, { fontSize: FONT_SIZES.xl }]}>Rapport de contrôle technique du véhicule</ThemedText>
//                     <ThemedText style={[styles.colorLight, { fontSize: FONT_SIZES.sm, flexShrink: 0 }]}>Évaluation officielle vérifiée AlloMotors</ThemedText>
//                 </View>
//             </View>



//             {/* ── Vehicle Image ── */}
//             {/* <View style={vStyles.imageBlock}>
//                 <Image source={{ uri: selectedThumb }} style={iStyles.mainImage} resizeMode="cover" />
//                 <View style={vStyles.watermarkWrap} pointerEvents="none">
//                     <Text style={tStyles.watermark}>ALLOMOTORS</Text>
//                 </View>
//             </View> */}

//             {/* ── Thumbnails ── */}
//             {/* {advert.thumbnails.length > 0 && (
//                 <FlatList
//                     horizontal
//                     data={advert.thumbnails}
//                     keyExtractor={(_, i) => String(i)}
//                     showsHorizontalScrollIndicator={false}
//                     contentContainerStyle={vStyles.thumbList}
//                     renderItem={({ item }) => (
//                         <TouchableOpacity onPress={() => setSelectedThumb(item)}>
//                             <Image
//                                 source={{ uri: item }}
//                                 style={[iStyles.thumb, selectedThumb === item && iStyles.thumbActive]}
//                                 resizeMode="cover"
//                             />
//                         </TouchableOpacity>
//                     )}
//                 />
//             )} */}



//             {/* ── Vehicle Info Card ── */}
//             <View style={[vStyles.infoCard, { marginTop: 20 }]}>
//                 <View style={vStyles.infoTopRow}>
//                     <View style={[vStyles.reportBadge, { backgroundColor: reportBadge.bg }]}>
//                         <Text style={[tStyles.reportBadgeText, { color: reportBadge.text }]}>
//                             ✓ {parsedData?.ReportStatus}
//                         </Text>
//                     </View>
//                     {/* <Text style={tStyles.vehicleType}>{parsedData?.VehicleType}</Text> */}
//                 </View>

//                 <Text style={tStyles.carTitle}>{parsedData?.Title}</Text>
//                 <Text style={tStyles.carRef}>Réf: {parsedData?.Reference}</Text>

//                 <View style={vStyles.divider} />

//                 <View style={vStyles.priceRow}>
//                     <View>
//                         <Text style={tStyles.priceLabel}>Prix</Text>

//                         {parsedData?.Attributes?.HidePrice ? (
//                             <>
//                                 <ThemedText style={[styles.colorDanger, styles.fontBold, { fontSize: 18, lineHeight: 18 }]}> **** </ThemedText>
//                             </>
//                         ) :
//                             (
//                                 <ThemedText style={[styles.colorDanger, styles.fontBold, { fontSize: 18, lineHeight: 18 }]}>{formatNODecimal(parsedData?.SellingPrice) || 0}€</ThemedText>
//                             )}
//                     </View>
//                     <View style={vStyles.officerBox}>
//                         {/* <Text style={tStyles.officerLabel}>Agent de contrôle</Text>
//                         <Text style={tStyles.officerName}>{advert.inspectionOfficer}</Text>
//                         <Text style={tStyles.officerDate}>{advert.inspectionDate}</Text> */}
//                     </View>
//                 </View>
//             </View>

//             {/* ── Score Card ── */}
//             {/* <ScoreSummary report={advert.techReport} /> */}

//             {/* ── Bottom Actions ── */}
//             {/* <View className='mb-3' style={vStyles.bottomActions}>
//                 <TouchableOpacity style={vStyles.btnOutline} onPress={() => navigation?.goBack()}>
//                     <Text style={tStyles.btnOutlineText}>← Retour</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity className="flex flex-row items-center justify-center gap-2 rounded-md py-4 px-4 w-full" style={[styles.danger, styles.btnShadow]}>
//                     <Text style={tStyles.btnPrimaryText}>📄 Télécharger PDF</Text>
//                 </TouchableOpacity>
//             </View> */}

             

//             {/* ── Inspection Sections ── */}
//             {SECTIONS.map(section => (
//                 <InspectionSection
//                     key={section.key}
//                     section={section}
//                     data={parsedData?.TechReport?.[section?.key] ?? advert?.techReport?.[section.key]} //parsedData?.TechReport[section.key] ?? {}
//                 />
 
//             ))}

//             {/* ── Signature Block ── */}
//             <View style={vStyles.signatureBlock}>
//                 <View style={vStyles.signatureBox}>
//                     <Image source={{ uri: parsedData?.TechReport?.EmpSignURL || '' }} resizeMode='contain' width={120} height={60} />
//                     <View style={vStyles.signatureLine} />
//                     <Text style={tStyles.signatureLabel}>
//                         Agent de contrôle technique{'\n'}Signature
//                     </Text>
//                 </View>
//                 {/* <View style={vStyles.signatureBox}>
//                     <View style={vStyles.signatureLine} />
//                     <Text style={tStyles.signatureLabel}>
//                         Propriétaire / Vendeur{'\n'}Signature
//                     </Text>
//                 </View> */}
//             </View>



//             <View style={vStyles.spacer} />
//         </ScrollView>
//     );
// }

