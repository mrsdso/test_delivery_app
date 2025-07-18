import Container from '@mui/material/Container';
import LogoutButton from '../components/LogoutButton';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar
} from 'recharts';
import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { fetchDeliveries, Delivery } from "../api/deliveries";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  AppBar,
  Toolbar,
  Button,
} from '@mui/material';
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import axios from "axios";
dayjs.extend(duration);

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Фильтры
  const [dateFilter, setDateFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [packagingFilter, setPackagingFilter] = useState("");

  // Справочники
  const [transportModels, setTransportModels] = useState<{ id: number; name: string }[]>([]);
  const [packagings, setPackagings] = useState<{ id: number; name: string }[]>([]);
  const [services, setServices] = useState<{ id: number; name: string }[]>([]);
  const [statuses, setStatuses] = useState<{ id: number; name: string }[]>([]);
  const [techStates, setTechStates] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    // Загрузка справочников с указанием порта Django
    const API = "http://185.23.236.113:8000/api";
    axios.get(`${API}/transportmodels/`).then(res => setTransportModels(res.data));
    axios.get(`${API}/packagings/`).then(res => setPackagings(res.data));
    axios.get(`${API}/services/`).then(res => setServices(res.data));
    axios.get(`${API}/statuses/`).then(res => setStatuses(res.data));
    axios.get(`${API}/techstates/`).then(res => setTechStates(res.data));
  }, []);

  useEffect(() => {
    fetchDeliveries()
      .then((response) => {
        // Преобразуем данные, чтобы вложенные объекты были с name
        const mapIdToObj = (id: number, arr: { id: number; name: string }[]): { id: number; name: string } | null => arr?.find((el) => el.id === id) || null;
        const deliveries = response.map((d: any) => ({
          ...d,
          transport_model: typeof d.transport_model === 'object' ? d.transport_model : mapIdToObj(d.transport_model, transportModels),
          packaging: typeof d.packaging === 'object' ? d.packaging : mapIdToObj(d.packaging, packagings),
          service: typeof d.service === 'object' ? d.service : mapIdToObj(d.service, services),
          status: typeof d.status === 'object' ? d.status : mapIdToObj(d.status, statuses),
          tech_state: typeof d.tech_state === 'object' ? d.tech_state : mapIdToObj(d.tech_state, techStates),
        }));
        setDeliveries(deliveries);
      })
      .catch(() => setError("Ошибка загрузки данных"))
      .finally(() => setLoading(false));
  }, [transportModels, packagings, services, statuses, techStates]);

  // Получаем уникальные значения для фильтров
  const serviceOptions = Array.from(new Set(deliveries.map(d => d.service?.name).filter(Boolean)));
  const packagingOptions = Array.from(new Set(deliveries.map(d => d.packaging?.name).filter(Boolean)));

  // Фильтрация данных
  const filteredDeliveries = deliveries.filter((d) => {
    const deliveryDate = d.delivery_time ? d.delivery_time.slice(0, 10) : "";
    return (
      (!dateFilter || deliveryDate === dateFilter) &&
      (!serviceFilter || d.service?.name === serviceFilter) &&
      (!packagingFilter || d.packaging?.name === packagingFilter)
    );
  });

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 70,
      renderCell: (params: any) => {
        const value = params.value;
        if (params.row.id_name) return params.row.id_name;
        if (!value && value !== 0) return "—";
        if (typeof value === "object" && value !== null) {
          if (value.name) return value.name;
          if (value.id !== undefined) return value.id;
        }
        return value;
      },
    },
    {
      field: "transport_model",
      headerName: "Модель транспорта",
      width: 160,
      renderCell: (params: any) => {
        const value = params.value;
        if (!value && value !== 0) return "—";
        if (typeof value === "object" && value !== null) {
          if (value.name) return value.name;
          if (value.id !== undefined) return value.id;
        }
        return value;
      },
    },
    {
      field: "vehicle_number",
      headerName: "Номер",
      width: 100,
      renderCell: (params: any) => {
        const value = params.value;
        if (params.row.vehicle_number_name) return params.row.vehicle_number_name;
        if (!value && value !== 0) return "—";
        if (typeof value === "object" && value !== null) {
          if (value.name) return value.name;
          if (value.id !== undefined) return value.id;
        }
        return value;
      },
    },
    {
      field: "packaging",
      headerName: "Упаковка",
      width: 120,
      renderCell: (params: any) => {
        const value = params.value;
        if (!value && value !== 0) return "—";
        if (typeof value === "object" && value !== null) {
          if (value.name) return value.name;
          if (value.id !== undefined) return value.id;
        }
        return value;
      },
    },
    {
      field: "service",
      headerName: "Услуга",
      width: 120,
      renderCell: (params: any) => {
        const value = params.value;
        if (!value && value !== 0) return "—";
        if (typeof value === "object" && value !== null) {
          if (value.name) return value.name;
          if (value.id !== undefined) return value.id;
        }
        return value;
      },
    },
    {
      field: "status",
      headerName: "Статус",
      width: 110,
      renderCell: (params: any) => {
        const value = params.value;
        if (!value && value !== 0) return "—";
        if (typeof value === "object" && value !== null) {
          if (value.name) return value.name;
          if (value.id !== undefined) return value.id;
        }
        return value;
      },
    },
    {
      field: "distance_km",
      headerName: "Дистанция (км)",
      width: 120,
      renderCell: (params: any) => {
        const value = params.value;
        if (params.row.distance_km_name) return params.row.distance_km_name;
        if (value === null || value === undefined || value === "") return "—";
        if (typeof value === "object" && value !== null) {
          if (value.name) return value.name;
          if (value.id !== undefined) return value.id;
        }
        return Number(value).toFixed(2);
      },
    },
    {
      field: "send_time",
      headerName: "Время отправки",
      width: 170,
      renderCell: (params: any) =>
        params.value
          ? new Date(params.value).toLocaleString()
          : "—",
    },
    {
      field: "delivery_time",
      headerName: "Время доставки",
      width: 170,
      renderCell: (params: any) =>
        params.value
          ? new Date(params.value).toLocaleDateString()
          : "—",
    },
    {
      field: "created_by",
      headerName: "Создал",
      width: 120,
      renderCell: (params: any) => {
        // Если есть поле created_by_name, показываем его
        if (params.row.created_by_name) return params.row.created_by_name;
        const value = params.value;
        if (!value && value !== 0) return "—";
        if (typeof value === "object" && value !== null) {
          if (value.name) return value.name;
          if (value.id !== undefined) return value.id;
        }
        return value;
      },
    },
    {
      field: "tech_state",
      headerName: "Тех. состояние",
      width: 140,
      renderCell: (params: any) => {
        const value = params.value;
        if (!value && value !== 0) return "—";
        if (typeof value === "object" && value !== null) {
          if (value.name) return value.name;
          if (value.id !== undefined) return value.id;
        }
        return value;
      },
    },
    {
      field: "travel_time",
      headerName: "Время в пути",
      width: 130,
      renderCell: (params: any) => {
        const value = params.value;
        if (params.row.travel_time_name) return params.row.travel_time_name;
        if (!value) return "—";
        if (typeof value === "object" && value !== null) {
          if (value.name) return value.name;
          if (value.id !== undefined) return value.id;
        }
        // Если это строка вида "HH:MM:SS" или "HH:MM"
        if (typeof value === "string") {
          const parts = value.split(":");
          if (parts.length >= 2) {
            const hours = parts[0];
            const minutes = parts[1];
            return `${Number(hours)} ч ${Number(minutes)} мин`;
          }
        }
        // Если это число (секунды)
        if (typeof value === "number") {
          const hours = Math.floor(value / 3600);
          const minutes = Math.floor((value % 3600) / 60);
          return `${hours} ч ${minutes} мин`;
        }
        return value;
      },
    },
    {
      field: "from_address",
      headerName: "Откуда",
      width: 180,
      renderCell: (params: any) => {
        const value = params.value;
        // Если есть поле from_address_name, показываем его
        if (params.row.from_address_name) return params.row.from_address_name;
        if (!value) return "—";
        if (typeof value === "object" && value !== null) {
          if (value.name) return value.name;
          if (value.id !== undefined) return value.id;
        }
        return value;
      },
    },
    {
      field: "to_address",
      headerName: "Куда",
      width: 180,
      renderCell: (params: any) => {
        const value = params.value;
        // Если есть поле to_address_name, показываем его
        if (params.row.to_address_name) return params.row.to_address_name;
        if (!value) return "—";
        if (typeof value === "object" && value !== null) {
          if (value.name) return value.name;
          if (value.id !== undefined) return value.id;
        }
        return value;
      },
    },
    {
      field: "media_file",
      headerName: "Медиафайл (PDF)",
      width: 150,
      renderCell: (params: any) =>
        params.value
          ? (
              <a
                href={params.value}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#90caf9" }}
              >
                PDF
              </a>
            )
          : "—",
    },
    {
      field: "log_file",
      headerName: "Лог-файл (CSV)",
      width: 150,
      renderCell: (params: any) =>
        params.value
          ? (
              <a
                href={params.value}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#90caf9" }}
              >
                CSV
              </a>
            )
          : "—",
    },
    {
      field: "comment",
      headerName: "Комментарий",
      width: 200,
      renderCell: (params: any) => {
        const value = params.value;
        if (params.row.comment_name) return params.row.comment_name;
        if (!value) return "—";
        if (typeof value === "object" && value !== null) {
          if (value.name) return value.name;
          if (value.id !== undefined) return value.id;
        }
        return value;
      },
    },
  ];

  // Массив ближайших 14 дней (включая сегодня)
  const next14Days = Array.from({ length: 14 }).map((_, i) =>
    dayjs().add(i, "day").format("YYYY-MM-DD")
  );

  // Группируем доставки по дате доставки
  const deliveriesByDate: Record<string, number> = {};
  filteredDeliveries.forEach((d) => {
    const date = d.delivery_time ? d.delivery_time.slice(0, 10) : "";
    if (date) deliveriesByDate[date] = (deliveriesByDate[date] || 0) + 1;
  });

  // Данные для графика: для каждой даты из ближайших 14 дней — количество доставок
  const chartData = next14Days.map((date) => ({
    name: date,
    value: deliveriesByDate[date] || 0,
  }));

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box m={3}>
      <AppBar position="static" sx={{ mb: 3, background: "#333" }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
            >
              Управление доставками
            </Typography>
            <Box sx={{ display: { xs: "inline", md: "flex" }, gap: 2 }}>
              <Button
                onClick={() => navigate("/")}
                sx={{ color: "#fff", display: "block" }}
              >
                Главная
              </Button>
            </Box>
            <LogoutButton />
          </Toolbar>
        </Container>
      </AppBar>
      <Box display="flex" justifyContent="flex-end" mb={2}>
      </Box>
      <Typography variant="h5" gutterBottom>
        Список доставок
      </Typography>
      {/* Фильтры */}
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Дата доставки"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
        />
        <TextField
          label="Тип доставки"
          select
          size="small"
          value={serviceFilter}
          onChange={e => setServiceFilter(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Все</MenuItem>
          {serviceOptions.map((name) => (
            <MenuItem key={name} value={name}>{name}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Груз (упаковка)"
          select
          size="small"
          value={packagingFilter}
          onChange={e => setPackagingFilter(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Все</MenuItem>
          {packagingOptions.map((name) => (
            <MenuItem key={name} value={name}>{name}</MenuItem>
          ))}
        </TextField>
      </Box>
      {/* График */}
      <Box mb={3} sx={{ width: "100%", height: 250, background: "#222", borderRadius: 2, p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Количество доставок по выбранным фильтрам
        </Typography>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#1976d2" name="Доставки" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <div style={{ height: 550, width: "100%" }}>
        <DataGrid
          rows={filteredDeliveries}
          columns={columns}
          getRowId={(row) => row.id}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
          }}
          disableRowSelectionOnClick
          sx={{
            color: "#fff",
          }}
        />
      </div>
    </Box>
  );
}