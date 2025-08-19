import { useTranslation } from "react-i18next";
import type { FunctionComponent } from "../common/types";
import { TicketLayout } from "../components/layout/Layout/TicketLayout";
import { Button } from "@mantine/core";

export const Home = (): FunctionComponent => {
	const { t, i18n } = useTranslation();

	const onTranslateButtonClick = async (): Promise<void> => {
		if (i18n.resolvedLanguage === "en") {
			await i18n.changeLanguage("es");
		} else {
			await i18n.changeLanguage("en");
		}
	};

	return (
		<TicketLayout>
			<p className="text-6xl">{t("home.greeting")}</p>
			<Button onClick={onTranslateButtonClick}>Test</Button>
		</TicketLayout>
	);
};
